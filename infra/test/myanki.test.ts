import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { RegionInfo } from 'aws-cdk-lib/region-info';
import { AwsSolutionsChecks } from 'cdk-nag';
import { CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST, s3PrefixListName } from '../lib/managed-prefix-list';
import { createMyAnkiStacks } from '../lib/myanki';

// Placeholder values only: the all-zero account and IDs are not real.
const CONTEXT = {
  region: 'ap-northeast-2',
  domainName: 'myanki.example.com',
  hostedZoneId: 'Z0000000000EXAMPLE',
  hostedZoneName: 'example.com',
  cloudFrontCertificateArn:
    'arn:aws:acm:us-east-1:000000000000:certificate/00000000-0000-0000-0000-000000000000',
  albCertificateArn:
    'arn:aws:acm:ap-northeast-2:000000000000:certificate/00000000-0000-0000-0000-000000000000',
  imageTag: 'v0.1.0',
};

// CloudFormation templates are untyped JSON that the tests index into freely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CfnJson = any;
type Resource = { Type: string; Properties: Record<string, CfnJson> };

function build(overrides: Record<string, string> = {}) {
  const app = new App({ context: { ...CONTEXT, ...overrides } });
  const stacks = createMyAnkiStacks(app);
  const template = Template.fromStack(stacks.appStack);
  const ecrTemplate = Template.fromStack(stacks.ecrStack);
  return { app, template, ecrTemplate };
}

function resourcesOfType(template: Template, type: string): Array<[string, Resource]> {
  return Object.entries(template.findResources(type)) as Array<[string, Resource]>;
}

function onlyResource(template: Template, type: string): [string, Resource] {
  const found = resourcesOfType(template, type);
  expect(found).toHaveLength(1);
  return found[0];
}

/** Every ingress rule that targets `groupLogicalId`, inline or standalone. */
function ingressRulesOf(template: Template, groupLogicalId: string): Array<Record<string, CfnJson>> {
  const [, group] = resourcesOfType(template, 'AWS::EC2::SecurityGroup').find(
    ([id]) => id === groupLogicalId,
  ) as [string, Resource];
  const inline = (group.Properties.SecurityGroupIngress ?? []) as Array<Record<string, CfnJson>>;
  const standalone = resourcesOfType(template, 'AWS::EC2::SecurityGroupIngress')
    .map(([, rule]) => rule.Properties)
    .filter((rule) => JSON.stringify(rule.GroupId) === JSON.stringify({ 'Fn::GetAtt': [groupLogicalId, 'GroupId'] }));
  return [...inline, ...standalone];
}

/** Standalone egress rules of `groupLogicalId` (CDK writes token peers as standalone rules). */
function egressRulesOf(template: Template, groupLogicalId: string): Array<Record<string, CfnJson>> {
  const [, group] = resourcesOfType(template, 'AWS::EC2::SecurityGroup').find(
    ([id]) => id === groupLogicalId,
  ) as [string, Resource];
  expect(group.Properties.SecurityGroupEgress).toBeUndefined();
  return resourcesOfType(template, 'AWS::EC2::SecurityGroupEgress')
    .map(([, rule]) => rule.Properties)
    .filter((rule) => JSON.stringify(rule.GroupId) === JSON.stringify({ 'Fn::GetAtt': [groupLogicalId, 'GroupId'] }));
}

/** The custom resource that looks up `prefixListName` at deploy time. */
function prefixListLookup(template: Template, prefixListName: string): [string, Resource] {
  const found = resourcesOfType(template, 'Custom::ManagedPrefixListLookup').filter(
    ([, lookup]) => JSON.parse(lookup.Properties.Create).parameters.Filters[0].Values[0] === prefixListName,
  );
  expect(found).toHaveLength(1);
  return found[0];
}

function albSecurityGroupId(template: Template): string {
  const [, alb] = onlyResource(template, 'AWS::ElasticLoadBalancingV2::LoadBalancer');
  expect(alb.Properties.SecurityGroups).toHaveLength(1);
  return alb.Properties.SecurityGroups[0]['Fn::GetAtt'][0];
}

function taskSecurityGroupId(template: Template): string {
  const [, service] = onlyResource(template, 'AWS::ECS::Service');
  const groups = service.Properties.NetworkConfiguration.AwsvpcConfiguration.SecurityGroups;
  expect(groups).toHaveLength(1);
  return groups[0]['Fn::GetAtt'][0];
}

const DYNAMIC_REFERENCE = (secretLogicalId: string, versionId = '') => ({
  // {{resolve:secretsmanager:<id>:SecretString:<json-key>:<version-stage>:<version-id>}}
  'Fn::Join': ['', ['{{resolve:secretsmanager:', { Ref: secretLogicalId }, `:SecretString:::${versionId}}}`]],
});

function secretIds(template: Template): { a: string; b: string } {
  const ids = resourcesOfType(template, 'AWS::SecretsManager::Secret').map(([id]) => id);
  const a = ids.find((id) => id.startsWith('OriginVerifySecretA'));
  const b = ids.find((id) => id.startsWith('OriginVerifySecretB'));
  expect(a && b).toBeTruthy();
  return { a: a as string, b: b as string };
}

describe('context', () => {
  test('synth fails with a clear error when required context is missing', () => {
    const app = new App({ context: {} });
    expect(() => createMyAnkiStacks(app)).toThrow(
      /Missing required CDK context value\(s\): region, domainName, hostedZoneId, hostedZoneName, cloudFrontCertificateArn, albCertificateArn, imageTag/,
    );
  });

  test('synth fails when one value is missing', () => {
    const context: Record<string, string> = { ...CONTEXT };
    delete context.imageTag;
    expect(() => createMyAnkiStacks(new App({ context }))).toThrow(/: imageTag\./);
  });

  test('the CloudFront certificate must be in us-east-1', () => {
    expect(() => build({ cloudFrontCertificateArn: CONTEXT.albCertificateArn })).toThrow(
      /cloudFrontCertificateArn must be an ACM certificate ARN in us-east-1/,
    );
  });

  test('the ALB certificate must be in the stack region', () => {
    expect(() => build({ albCertificateArn: CONTEXT.cloudFrontCertificateArn })).toThrow(
      /albCertificateArn must be an ACM certificate ARN in ap-northeast-2/,
    );
  });

  test('opt-in regions are rejected because CloudFront logging cannot reach them', () => {
    expect(() =>
      build({
        region: 'ap-east-1',
        albCertificateArn: CONTEXT.albCertificateArn.replace('ap-northeast-2', 'ap-east-1'),
      }),
    ).toThrow(/region "ap-east-1" is an opt-in region/);
  });

  test('the domain must be inside the hosted zone', () => {
    expect(() => build({ domainName: 'myanki.example.org' })).toThrow(/domainName must be inside hostedZoneName/);
  });
});

describe('cdk-nag AwsSolutions', () => {
  test('reports no unacknowledged findings', () => {
    const { app } = build();
    const report = new AwsSolutionsChecks(app).validateScope(app);
    expect(report.violations).toEqual([]);
    expect(report.success).toBe(true);
  });
});

describe('ALB protection', () => {
  test('the ALB security group only allows 443 from the CloudFront origin-facing prefix list', () => {
    const { template } = build();
    const rules = ingressRulesOf(template, albSecurityGroupId(template));
    expect(rules).toHaveLength(1);

    const [lookupId, lookup] = prefixListLookup(template, CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST);
    expect(rules[0]).toEqual({
      Description: expect.any(String),
      GroupId: expect.anything(),
      IpProtocol: 'tcp',
      FromPort: 443,
      ToPort: 443,
      SourcePrefixListId: { 'Fn::GetAtt': [lookupId, 'PrefixLists.0.PrefixListId'] },
    });
    expect(rules[0]).not.toHaveProperty('CidrIp');
    expect(rules[0]).not.toHaveProperty('CidrIpv6');

    // The ID is looked up at deploy time, not hardcoded.
    expect(JSON.parse(lookup.Properties.Create)).toMatchObject({
      service: 'EC2',
      action: 'describeManagedPrefixLists',
      parameters: { Filters: [{ Name: 'prefix-list-name', Values: [CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST] }] },
    });
    expect(lookup.Properties.Update).toEqual(lookup.Properties.Create);
    expect(JSON.stringify(template.toJSON())).not.toMatch(/"pl-[0-9a-f]+"/);
  });

  test('prefix list lookups may only call ec2:DescribeManagedPrefixLists', () => {
    const { template } = build();
    const lookups = resourcesOfType(template, 'Custom::ManagedPrefixListLookup');
    expect(lookups).toHaveLength(2);
    for (const [, lookup] of lookups) {
      const [policyId] = (lookup as unknown as { DependsOn: string[] }).DependsOn;
      const policy = template.findResources('AWS::IAM::Policy')[policyId];
      expect(policy.Properties.PolicyDocument.Statement).toEqual([
        { Action: 'ec2:DescribeManagedPrefixLists', Effect: 'Allow', Resource: '*' },
      ]);
    }
  });

  test('the ALB security group can only send 8080 to the task security group', () => {
    const { template } = build();
    const egress = egressRulesOf(template, albSecurityGroupId(template));
    expect(egress).toEqual([
      {
        Description: expect.any(String),
        GroupId: expect.anything(),
        IpProtocol: 'tcp',
        FromPort: 8080,
        ToPort: 8080,
        DestinationSecurityGroupId: { 'Fn::GetAtt': [taskSecurityGroupId(template), 'GroupId'] },
      },
    ]);
  });

  test('no security group is open to the internet', () => {
    const { template } = build();
    const allIngress = [
      ...resourcesOfType(template, 'AWS::EC2::SecurityGroup').flatMap(
        ([, group]) => group.Properties.SecurityGroupIngress ?? [],
      ),
      ...resourcesOfType(template, 'AWS::EC2::SecurityGroupIngress').map(([, rule]) => rule.Properties),
    ];
    for (const rule of allIngress) {
      expect(rule.CidrIp).not.toBe('0.0.0.0/0');
      expect(rule.CidrIpv6).not.toBe('::/0');
    }
    // No group in this stack allows all outbound traffic either.
    for (const [, group] of resourcesOfType(template, 'AWS::EC2::SecurityGroup')) {
      for (const rule of group.Properties.SecurityGroupEgress ?? []) {
        expect(rule.CidrIp).not.toBe('0.0.0.0/0');
      }
    }
  });

  test('the HTTPS listener answers 403 by default', () => {
    const { template } = build();
    const [, listener] = onlyResource(template, 'AWS::ElasticLoadBalancingV2::Listener');
    expect(listener.Properties).toMatchObject({
      Port: 443,
      Protocol: 'HTTPS',
      SslPolicy: 'ELBSecurityPolicy-TLS13-1-2-2021-06',
      DefaultActions: [{ Type: 'fixed-response', FixedResponseConfig: { StatusCode: '403' } }],
    });
  });

  test('only requests with a matching X-Origin-Verify header reach the target group', () => {
    const { template } = build();
    const { a, b } = secretIds(template);
    const rules = resourcesOfType(template, 'AWS::ElasticLoadBalancingV2::ListenerRule').map(([, r]) => r.Properties);
    const forwarding = rules.filter((rule) =>
      (rule.Actions as Array<{ Type: string }>).some((action) => action.Type === 'forward'),
    );
    expect(forwarding).toHaveLength(1);
    expect(forwarding[0].Conditions).toEqual([
      {
        Field: 'http-header',
        HttpHeaderConfig: {
          HttpHeaderName: 'X-Origin-Verify',
          // Current and next value, both as dynamic references.
          Values: [DYNAMIC_REFERENCE(a), DYNAMIC_REFERENCE(b)],
        },
      },
    ]);
  });

  test('the ALB drops invalid headers, has deletion protection and writes access logs', () => {
    const { template } = build();
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
      Scheme: 'internet-facing',
      LoadBalancerAttributes: Match.arrayWith([
        { Key: 'deletion_protection.enabled', Value: 'true' },
        { Key: 'routing.http.drop_invalid_header_fields.enabled', Value: 'true' },
        { Key: 'access_logs.s3.enabled', Value: 'true' },
      ]),
    });
  });
});

describe('tasks', () => {
  test('the task security group only allows 8080 from the ALB security group', () => {
    const { template } = build();
    const albGroup = albSecurityGroupId(template);
    const rules = ingressRulesOf(template, taskSecurityGroupId(template));
    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      IpProtocol: 'tcp',
      FromPort: 8080,
      ToPort: 8080,
      SourceSecurityGroupId: { 'Fn::GetAtt': [albGroup, 'GroupId'] },
    });
  });

  test('tasks can only send HTTPS to the interface endpoints and the S3 prefix list', () => {
    const { template } = build();
    const egress = egressRulesOf(template, taskSecurityGroupId(template));
    const endpointGroups = resourcesOfType(template, 'AWS::EC2::VPCEndpoint')
      .filter(([, endpoint]) => endpoint.Properties.VpcEndpointType === 'Interface')
      .map(([, endpoint]) => JSON.stringify(endpoint.Properties.SecurityGroupIds));
    expect(new Set(endpointGroups).size).toBe(1);
    const [endpointGroup] = JSON.parse(endpointGroups[0]);
    const [s3LookupId] = prefixListLookup(template, s3PrefixListName(CONTEXT.region));

    expect(egress).toHaveLength(2);
    expect(egress).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ IpProtocol: 'tcp', FromPort: 443, ToPort: 443, DestinationSecurityGroupId: endpointGroup }),
        expect.objectContaining({
          IpProtocol: 'tcp',
          FromPort: 443,
          ToPort: 443,
          DestinationPrefixListId: { 'Fn::GetAtt': [s3LookupId, 'PrefixLists.0.PrefixListId'] },
        }),
      ]),
    );
    // The interface endpoints accept HTTPS from tasks only.
    const endpointGroupId = endpointGroup['Fn::GetAtt'][0];
    expect(ingressRulesOf(template, endpointGroupId)).toEqual([
      expect.objectContaining({
        IpProtocol: 'tcp',
        FromPort: 443,
        ToPort: 443,
        SourceSecurityGroupId: { 'Fn::GetAtt': [taskSecurityGroupId(template), 'GroupId'] },
      }),
    ]);
  });

  test('the service is created after the VPC endpoints it needs', () => {
    const { template } = build();
    const [, service] = onlyResource(template, 'AWS::ECS::Service');
    const dependsOn = (service as unknown as { DependsOn: string[] }).DependsOn;
    const endpointIds = resourcesOfType(template, 'AWS::EC2::VPCEndpoint').map(([id]) => id);
    expect(endpointIds).toHaveLength(4);
    expect(dependsOn).toEqual(expect.arrayContaining(endpointIds));
  });

  test('the task definition runs as non-root with a read-only root filesystem', () => {
    const { template } = build();
    const [, taskDefinition] = onlyResource(template, 'AWS::ECS::TaskDefinition');
    const containers = taskDefinition.Properties.ContainerDefinitions as Array<Record<string, CfnJson>>;
    expect(containers).toHaveLength(1);
    const [container] = containers;
    expect(container.ReadonlyRootFilesystem).toBe(true);
    expect(container.Privileged).toBe(false);
    expect(container.User).toBe('101:101');
    expect(container.User).not.toMatch(/^(0|root)(:|$)/);
    // /tmp is the only writable path.
    expect(container.MountPoints).toEqual([{ ContainerPath: '/tmp', ReadOnly: false, SourceVolume: 'tmp' }]);
    expect(container.HealthCheck.Command.join(' ')).toContain('/healthz');
  });

  test('the target group health check uses /healthz on port 8080', () => {
    const { template } = build();
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      Port: 8080,
      Protocol: 'HTTP',
      TargetType: 'ip',
      HealthCheckPath: '/healthz',
    });
  });

  test('tasks run in isolated subnets without public IPs', () => {
    const { template } = build();
    template.hasResourceProperties('AWS::ECS::Service', {
      LaunchType: 'FARGATE',
      NetworkConfiguration: { AwsvpcConfiguration: { AssignPublicIp: 'DISABLED' } },
    });
  });

  test('the task role has no permissions', () => {
    const { template } = build();
    const [, taskDefinition] = onlyResource(template, 'AWS::ECS::TaskDefinition');
    const taskRoleId = taskDefinition.Properties.TaskRoleArn['Fn::GetAtt'][0];
    const attached = resourcesOfType(template, 'AWS::IAM::Policy').filter(([, policy]) =>
      JSON.stringify(policy.Properties.Roles).includes(taskRoleId),
    );
    expect(attached).toEqual([]);
    expect(template.findResources('AWS::IAM::Role')[taskRoleId].Properties.ManagedPolicyArns).toBeUndefined();
  });
});

describe('network', () => {
  test('there is no NAT gateway', () => {
    const { template } = build();
    template.resourceCountIs('AWS::EC2::NatGateway', 0);
  });

  test('ECR and Logs use interface endpoints and S3 uses a gateway endpoint', () => {
    const { template } = build();
    const endpoints = resourcesOfType(template, 'AWS::EC2::VPCEndpoint').map(([, endpoint]) => ({
      service: JSON.stringify(endpoint.Properties.ServiceName),
      type: endpoint.Properties.VpcEndpointType ?? 'Gateway',
    }));
    const find = (suffix: string) => endpoints.find((endpoint) => endpoint.service.includes(suffix));
    expect(find('.ecr.api')?.type).toBe('Interface');
    expect(find('.ecr.dkr')?.type).toBe('Interface');
    expect(find('.logs')?.type).toBe('Interface');
    expect(find('.s3')?.type).toBe('Gateway');
    expect(endpoints).toHaveLength(4);
  });
});

describe('CloudFront', () => {
  test('connects to the ALB over HTTPS only and redirects viewers to HTTPS', () => {
    const { template } = build();
    const [, distribution] = onlyResource(template, 'AWS::CloudFront::Distribution');
    const config = distribution.Properties.DistributionConfig;
    expect(config.Origins).toHaveLength(1);
    expect(config.Origins[0].DomainName).toBe('origin.myanki.example.com');
    expect(config.Origins[0].CustomOriginConfig).toEqual({
      OriginProtocolPolicy: 'https-only',
      OriginSSLProtocols: ['TLSv1.2'],
    });
    expect(config.DefaultCacheBehavior.ViewerProtocolPolicy).toBe('redirect-to-https');
    // The only extra behavior is the uncached health check, on the same origin.
    expect(config.CacheBehaviors).toEqual([
      expect.objectContaining({
        PathPattern: '/healthz',
        TargetOriginId: config.DefaultCacheBehavior.TargetOriginId,
        ViewerProtocolPolicy: 'redirect-to-https',
        // Managed-CachingDisabled
        CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
      }),
    ]);
    expect(config.ViewerCertificate).toMatchObject({
      MinimumProtocolVersion: 'TLSv1.2_2021',
      SslSupportMethod: 'sni-only',
    });
  });

  test('adds the AWS-managed security headers policy to responses', () => {
    const { template } = build();
    const [, distribution] = onlyResource(template, 'AWS::CloudFront::Distribution');
    const config = distribution.Properties.DistributionConfig;
    for (const behavior of [config.DefaultCacheBehavior, ...config.CacheBehaviors]) {
      // Managed-SecurityHeadersPolicy
      expect(behavior.ResponseHeadersPolicyId).toBe('67f7725c-6f97-4210-82d7-5512b31e9d03');
    }
  });

  test('sends the active origin-verify secret as a dynamic reference, never the value', () => {
    const { template } = build();
    const { a } = secretIds(template);
    const [, distribution] = onlyResource(template, 'AWS::CloudFront::Distribution');
    expect(distribution.Properties.DistributionConfig.Origins[0].OriginCustomHeaders).toEqual([
      { HeaderName: 'X-Origin-Verify', HeaderValue: DYNAMIC_REFERENCE(a) },
    ]);
  });

  test('switches to slot b and pins version IDs for rotation', () => {
    const { template } = build({ originVerifyActive: 'b', originVerifyVersionB: 'example-version-b' });
    const { a, b } = secretIds(template);
    const [, distribution] = onlyResource(template, 'AWS::CloudFront::Distribution');
    expect(distribution.Properties.DistributionConfig.Origins[0].OriginCustomHeaders[0].HeaderValue).toEqual(
      DYNAMIC_REFERENCE(b, 'example-version-b'),
    );
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::ListenerRule', {
      Conditions: [{ HttpHeaderConfig: { Values: [DYNAMIC_REFERENCE(a), DYNAMIC_REFERENCE(b, 'example-version-b')] } }],
    });
  });

  test('rejects an unknown origin-verify slot', () => {
    expect(() => build({ originVerifyActive: 'c' })).toThrow(/originVerifyActive must be "a" or "b"/);
  });
});

describe('secrets and outputs', () => {
  test('origin-verify secrets are generated by Secrets Manager with at least 32 characters', () => {
    const { template } = build();
    const secrets = resourcesOfType(template, 'AWS::SecretsManager::Secret');
    expect(secrets).toHaveLength(2);
    for (const [, secret] of secrets) {
      expect(secret.Properties.SecretString).toBeUndefined();
      expect(secret.Properties.GenerateSecretString.PasswordLength).toBeGreaterThanOrEqual(32);
    }
  });

  test('neither stack has CloudFormation outputs', () => {
    const { template, ecrTemplate } = build();
    expect(template.toJSON().Outputs).toBeUndefined();
    expect(ecrTemplate.toJSON().Outputs).toBeUndefined();
  });

  test('no account ID is written into the template', () => {
    const { template, ecrTemplate } = build();
    // Allowed: the placeholder account in the context certificate ARNs, and
    // the AWS-owned ELB log delivery account that the bucket policy grants.
    const allowed = new Set(['000000000000', RegionInfo.get(CONTEXT.region).elbv2Account]);
    for (const json of [template.toJSON(), ecrTemplate.toJSON()]) {
      const accounts = JSON.stringify(json).match(/\b\d{12}\b/g) ?? [];
      expect(accounts.filter((account) => !allowed.has(account))).toEqual([]);
    }
  });
});

describe('logs and images', () => {
  test('the log bucket blocks public access, enforces TLS, encrypts and expires objects', () => {
    const { template } = build();
    const [bucketId] = onlyResource(template, 'AWS::S3::Bucket');
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }],
      },
      LifecycleConfiguration: { Rules: [Match.objectLike({ ExpirationInDays: 90, Status: 'Enabled' })] },
    });
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      Bucket: { Ref: bucketId },
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Deny',
            Action: 's3:*',
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          }),
        ]),
      },
    });
  });

  test('log groups keep logs for 30 days', () => {
    const { template } = build();
    const groups = resourcesOfType(template, 'AWS::Logs::LogGroup');
    expect(groups.length).toBeGreaterThan(0);
    for (const [, group] of groups) {
      expect(group.Properties.RetentionInDays).toBe(30);
    }
  });

  test('the ECR repository scans on push and has immutable tags', () => {
    const { ecrTemplate } = build();
    ecrTemplate.hasResourceProperties('AWS::ECR::Repository', {
      RepositoryName: 'myanki',
      ImageScanningConfiguration: { ScanOnPush: true },
      ImageTagMutability: 'IMMUTABLE',
    });
  });
});
