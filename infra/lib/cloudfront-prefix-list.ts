import { RemovalPolicy, Validations } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export const CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST = 'com.amazonaws.global.cloudfront.origin-facing';

/**
 * Resolves the ID of the AWS-managed CloudFront origin-facing prefix list at
 * deploy time.
 *
 * The ID differs per region, so it is not hardcoded. `fromLookup` would need
 * AWS credentials during `cdk synth`, so the lookup runs in CloudFormation
 * instead: a custom resource calls `ec2:DescribeManagedPrefixLists` (and
 * nothing else) on create and on every update.
 */
export class CloudFrontOriginFacingPrefixList extends Construct {
  public readonly prefixListId: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const describe: AwsSdkCall = {
      service: 'EC2',
      action: 'describeManagedPrefixLists',
      parameters: {
        Filters: [{ Name: 'prefix-list-name', Values: [CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST] }],
      },
      physicalResourceId: PhysicalResourceId.of(CLOUDFRONT_ORIGIN_FACING_PREFIX_LIST),
      outputPaths: ['PrefixLists.0.PrefixListId'],
    };

    const lookup = new AwsCustomResource(this, 'Lookup', {
      resourceType: 'Custom::CloudFrontOriginFacingPrefixList',
      onCreate: describe,
      onUpdate: describe,
      policy: AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['ec2:DescribeManagedPrefixLists'],
          resources: ['*'],
        }),
      ]),
      installLatestAwsSdk: false,
      logGroup: new logs.LogGroup(this, 'LookupLogs', {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    });

    this.prefixListId = lookup.getResponseField('PrefixLists.0.PrefixListId');

    Validations.of(lookup).acknowledge({
      id: 'AwsSolutions-IAM5[Resource::*]',
      reason:
        'ec2:DescribeManagedPrefixLists does not support resource-level permissions, so the ' +
        'statement needs Resource "*". It is the only action the lookup is allowed to call.',
    });
  }
}
