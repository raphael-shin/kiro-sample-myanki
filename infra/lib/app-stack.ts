import { Duration, RemovalPolicy, SecretValue, Stack, StackProps, Validations } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST, ManagedPrefixList } from './managed-prefix-list';
import { MyAnkiConfig, OriginVerifySlot } from './config';
import { REPOSITORY_NAME } from './ecr-stack';

export const ORIGIN_VERIFY_HEADER = 'X-Origin-Verify';
export const CONTAINER_PORT = 8080;
/** uid:gid of the `nginx` user in nginxinc/nginx-unprivileged. */
export const CONTAINER_USER = '101:101';
export const HEALTH_CHECK_PATH = '/healthz';

export interface MyAnkiAppStackProps extends StackProps {
  readonly config: MyAnkiConfig;
}

/**
 * CloudFront -> (HTTPS + X-Origin-Verify) -> ALB in public subnets -> Fargate
 * tasks in isolated subnets. The ALB only accepts traffic from the CloudFront
 * origin-facing prefix list, and only forwards requests that carry the
 * origin-verify header; everything else gets a fixed 403.
 */
export class MyAnkiAppStack extends Stack {
  constructor(scope: Construct, id: string, props: MyAnkiAppStackProps) {
    super(scope, id, props);
    const { config } = props;

    // ---------------------------------------------------------------- logs
    const logBucket = new s3.Bucket(this, 'AccessLogBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      // ALB access logs only support SSE-S3.
      encryption: s3.BucketEncryption.S3_MANAGED,
      // CloudFront standard logging writes through a bucket ACL grant, which
      // BucketOwnerEnforced would reject. Block Public Access stays on.
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      lifecycleRules: [{ id: 'expire-access-logs', expiration: Duration.days(90) }],
      removalPolicy: RemovalPolicy.RETAIN,
    });
    Validations.of(logBucket).acknowledge({
      id: 'AwsSolutions-S1',
      reason:
        'This bucket is the access-log destination for the ALB and CloudFront. Logging the ' +
        'log bucket into itself would loop; a second bucket only for its own logs is out of scope.',
    });

    // ------------------------------------------------------------- network
    const flowLogGroup = new logs.LogGroup(this, 'VpcFlowLogs', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.40.0.0/16'),
      maxAzs: 2,
      // Tasks only talk to AWS services, through VPC endpoints.
      natGateways: 0,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24, mapPublicIpOnLaunch: false },
        { name: 'App', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
          subnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
        },
      },
      flowLogs: {
        all: {
          destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup),
          trafficType: ec2.FlowLogTrafficType.ALL,
        },
      },
    });

    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      description: 'MyAnki ALB: HTTPS from the CloudFront origin-facing prefix list only',
      allowAllOutbound: false,
    });
    // The managed prefix list counts as many rules against the security group
    // quota. Do not add other ingress rules to this group.
    const cloudFrontPrefixList = new ManagedPrefixList(this, 'CloudFrontPrefixList', {
      prefixListName: CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST,
    });
    albSecurityGroup.addIngressRule(
      ec2.Peer.prefixList(cloudFrontPrefixList.prefixListId),
      ec2.Port.tcp(443),
      'HTTPS from CloudFront origin-facing servers',
    );

    const taskSecurityGroup = new ec2.SecurityGroup(this, 'TaskSecurityGroup', {
      vpc,
      description: 'MyAnki tasks: port 8080 from the ALB only',
      // Egress has nowhere to go but the VPC endpoints: the subnets have no
      // NAT gateway and no internet gateway route.
      allowAllOutbound: true,
    });

    const endpointSecurityGroup = new ec2.SecurityGroup(this, 'EndpointSecurityGroup', {
      vpc,
      description: 'MyAnki interface endpoints: HTTPS from tasks only',
      allowAllOutbound: false,
    });
    endpointSecurityGroup.addIngressRule(taskSecurityGroup, ec2.Port.tcp(443), 'HTTPS from MyAnki tasks');

    for (const [id, service] of [
      ['EcrApiEndpoint', ec2.InterfaceVpcEndpointAwsService.ECR],
      ['EcrDockerEndpoint', ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER],
      ['LogsEndpoint', ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS],
    ] as const) {
      vpc.addInterfaceEndpoint(id, {
        service,
        subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        privateDnsEnabled: true,
        securityGroups: [endpointSecurityGroup],
        open: false,
      });
    }

    // ------------------------------------------------------ origin secret
    const originVerifySecrets: Record<OriginVerifySlot, secretsmanager.Secret> = {
      a: this.createOriginVerifySecret('OriginVerifySecretA', 'a'),
      b: this.createOriginVerifySecret('OriginVerifySecretB', 'b'),
    };
    const versionIds: Record<OriginVerifySlot, string | undefined> = {
      a: config.originVerifyVersionA,
      b: config.originVerifyVersionB,
    };
    // A CloudFormation dynamic reference, not the value: the template only
    // holds `{{resolve:secretsmanager:...}}`, resolved by CloudFormation at
    // deploy time. Pinning a version ID changes the template, which is what
    // makes CloudFormation re-resolve it during rotation.
    const originVerifyValue = (slot: OriginVerifySlot): string =>
      SecretValue.secretsManager(originVerifySecrets[slot].secretArn, {
        versionId: versionIds[slot],
      }).unsafeUnwrap();

    // --------------------------------------------------------------- ECS
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });

    const appLogGroup = new logs.LogGroup(this, 'AppLogs', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // The task role is created without any permissions: the app never calls
    // AWS from the server. Bedrock is called from the user's browser.
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
      volumes: [{ name: 'tmp' }],
    });

    const repository = ecr.Repository.fromRepositoryName(this, 'Repository', REPOSITORY_NAME);
    const container = taskDefinition.addContainer('Web', {
      image: ecs.ContainerImage.fromEcrRepository(repository, config.imageTag),
      user: CONTAINER_USER,
      readonlyRootFilesystem: true,
      privileged: false,
      portMappings: [{ containerPort: CONTAINER_PORT, protocol: ecs.Protocol.TCP }],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'web', logGroup: appLogGroup }),
      healthCheck: {
        command: ['CMD-SHELL', `wget -q -O /dev/null http://127.0.0.1:${CONTAINER_PORT}${HEALTH_CHECK_PATH} || exit 1`],
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        retries: 3,
        startPeriod: Duration.seconds(10),
      },
    });
    // nginx writes its pid and temp files under /tmp; that is the only
    // writable path.
    container.addMountPoints({ containerPath: '/tmp', sourceVolume: 'tmp', readOnly: false });

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: 2,
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [taskSecurityGroup],
      circuitBreaker: { rollback: true },
    });

    // --------------------------------------------------------------- ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: albSecurityGroup,
      dropInvalidHeaderFields: true,
      deletionProtection: true,
    });
    alb.logAccessLogs(logBucket, 'alb');

    const listener = alb.addListener('Https', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      // `open: true` would add a 0.0.0.0/0 ingress rule to the ALB group.
      open: false,
      sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
      certificates: [elbv2.ListenerCertificate.fromArn(config.albCertificateArn)],
      defaultAction: elbv2.ListenerAction.fixedResponse(403, {
        contentType: 'text/plain',
        messageBody: 'Forbidden',
      }),
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc,
      port: CONTAINER_PORT,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      targets: [service],
      deregistrationDelay: Duration.seconds(30),
      healthCheck: { path: HEALTH_CHECK_PATH, healthyHttpCodes: '200' },
    });

    // Both secrets are accepted so CloudFront can switch from one to the
    // other without a window of 403s (see infra/README.md).
    listener.addAction('VerifiedOrigin', {
      priority: 10,
      conditions: [
        elbv2.ListenerCondition.httpHeader(ORIGIN_VERIFY_HEADER, [originVerifyValue('a'), originVerifyValue('b')]),
      ],
      action: elbv2.ListenerAction.forward([targetGroup]),
    });

    // -------------------------------------------------------- CloudFront
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'MyAnki',
      domainNames: [config.domainName],
      certificate: acm.Certificate.fromCertificateArn(this, 'ViewerCertificate', config.cloudFrontCertificateArn),
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      enableLogging: true,
      logBucket,
      logFilePrefix: 'cloudfront/',
      defaultBehavior: {
        origin: new origins.HttpOrigin(config.originDomainName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
          customHeaders: { [ORIGIN_VERIFY_HEADER]: originVerifyValue(config.originVerifyActive) },
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        // AWS-managed SecurityHeadersPolicy: HSTS, nosniff, frame options,
        // referrer policy. A Content-Security-Policy needs the app's real
        // connect/style sources and is left to a separate change.
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        compress: true,
      },
    });
    Validations.of(distribution).acknowledge(
      {
        id: 'AwsSolutions-CFR1',
        reason: 'MyAnki is a public study app with no country restrictions.',
      },
      {
        id: 'AwsSolutions-CFR2',
        reason: 'AWS WAF is out of scope for issue #6 and will be handled in a separate issue.',
      },
    );

    // ------------------------------------------------------------- DNS
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.hostedZoneName,
    });
    // CloudFront connects to this name and validates the ALB certificate
    // against it.
    new route53.ARecord(this, 'OriginAliasRecord', {
      zone,
      recordName: config.originDomainName,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(alb)),
    });
    const siteTarget = route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution));
    new route53.ARecord(this, 'SiteAliasRecord', { zone, recordName: config.domainName, target: siteTarget });
    new route53.AaaaRecord(this, 'SiteAliasRecordIpv6', { zone, recordName: config.domainName, target: siteTarget });

    // ------------------------------------------------ cdk-nag exceptions
    Validations.of(taskDefinition).acknowledge({
      id: 'AwsSolutions-IAM5[Resource::*]',
      reason:
        'The execution role needs ecr:GetAuthorizationToken, which only supports Resource "*". ' +
        'Image pull and log writes are scoped to the MyAnki repository and log group.',
    });
    // The provider Lambda behind AwsCustomResource is a stack-level singleton
    // that CDK creates, so the acknowledgment has to sit on the stack. It is
    // limited to this one managed policy.
    Validations.of(this).acknowledge({
      id: 'AwsSolutions-IAM4[Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole]',
      reason:
        'CDK-managed custom resource provider Lambdas use AWSLambdaBasicExecutionRole only to write ' +
        'their own logs. The prefix list lookup has a single ec2:DescribeManagedPrefixLists statement.',
    });
  }

  private createOriginVerifySecret(id: string, slot: OriginVerifySlot): secretsmanager.Secret {
    const secret = new secretsmanager.Secret(this, id, {
      // A stable name so the rotation steps in infra/README.md can address it.
      secretName: `${this.stackName}/origin-verify/${slot}`,
      description: `MyAnki ${ORIGIN_VERIFY_HEADER} header value (slot ${slot})`,
      generateSecretString: {
        passwordLength: 64,
        excludePunctuation: true,
        includeSpace: false,
      },
    });
    Validations.of(secret).acknowledge({
      id: 'AwsSolutions-SMG4',
      reason:
        'Rotated by the two-slot procedure in infra/README.md. CloudFront and the ALB read the ' +
        'value through CloudFormation dynamic references, which only re-resolve on a stack ' +
        'update, so a Secrets Manager rotation Lambda would desync them and cause 403s.',
    });
    return secret;
  }
}
