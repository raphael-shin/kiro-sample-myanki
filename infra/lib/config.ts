import { RegionInfo } from 'aws-cdk-lib/region-info';

/**
 * Deployment parameters for the MyAnki stacks.
 *
 * Every environment-specific value comes from CDK context (`-c key=value` or
 * `cdk.context.json`). Nothing here has a default that points at a real
 * account, domain or certificate, and a missing value fails synth with an
 * error that names the key.
 */

export type OriginVerifySlot = 'a' | 'b';

export interface MyAnkiConfig {
  /** Region for the ALB, ECS and VPC (e.g. ap-northeast-2). */
  readonly region: string;
  /** Public site name served by CloudFront (e.g. myanki.example.com). */
  readonly domainName: string;
  /** Name the ALB is reachable at for CloudFront: `origin.<domainName>`. */
  readonly originDomainName: string;
  /** Route 53 hosted zone that contains `domainName`. */
  readonly hostedZoneId: string;
  readonly hostedZoneName: string;
  /** ACM certificate in us-east-1 covering `domainName` (CloudFront viewer). */
  readonly cloudFrontCertificateArn: string;
  /** ACM certificate in `region` covering `originDomainName` (ALB listener). */
  readonly albCertificateArn: string;
  /** Tag of the app image in the MyAnki ECR repository. */
  readonly imageTag: string;
  /** Which origin-verify secret CloudFront sends. The ALB accepts both. */
  readonly originVerifyActive: OriginVerifySlot;
  /** Secrets Manager version IDs, pinned during header rotation. */
  readonly originVerifyVersionA?: string;
  readonly originVerifyVersionB?: string;
}

export const REQUIRED_CONTEXT_KEYS = [
  'region',
  'domainName',
  'hostedZoneId',
  'hostedZoneName',
  'cloudFrontCertificateArn',
  'albCertificateArn',
  'imageTag',
] as const;

type ContextReader = (key: string) => unknown;

function readString(read: ContextReader, key: string): string | undefined {
  const value = read(key);
  if (value === undefined || value === null) {
    return undefined;
  }
  const text = String(value).trim();
  return text === '' ? undefined : text;
}

function acmRegion(arn: string): string | undefined {
  // arn:<partition>:acm:<region>:<account>:certificate/<id>
  const match = /^arn:[a-z-]+:acm:([a-z0-9-]+):\d{12}:certificate\/[A-Za-z0-9-]+$/.exec(arn);
  return match?.[1];
}

/**
 * Reads and validates the context. Throws one error listing every problem so
 * the operator can fix them in a single pass.
 */
export function loadConfig(read: ContextReader): MyAnkiConfig {
  const missing = REQUIRED_CONTEXT_KEYS.filter((key) => readString(read, key) === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Missing required CDK context value(s): ${missing.join(', ')}. ` +
        'Pass each one with -c <key>=<value> (see infra/README.md).',
    );
  }

  const value = (key: string): string => readString(read, key) as string;
  const region = value('region');
  const domainName = value('domainName').toLowerCase().replace(/\.$/, '');
  const hostedZoneName = value('hostedZoneName').toLowerCase().replace(/\.$/, '');
  const cloudFrontCertificateArn = value('cloudFrontCertificateArn');
  const albCertificateArn = value('albCertificateArn');
  const activeRaw = readString(read, 'originVerifyActive') ?? 'a';

  const problems: string[] = [];
  if (!/^[a-z]{2}(-[a-z]+)+-\d$/.test(region)) {
    problems.push(`region "${region}" is not an AWS region name`);
  } else if (RegionInfo.get(region).isOptInRegion) {
    // The access log bucket lives in this region, and CloudFront standard
    // logging (legacy) cannot deliver to buckets in opt-in regions.
    problems.push(`region "${region}" is an opt-in region; CloudFront standard logging cannot deliver there`);
  }
  if (domainName !== hostedZoneName && !domainName.endsWith(`.${hostedZoneName}`)) {
    problems.push('domainName must be inside hostedZoneName');
  }
  if (acmRegion(cloudFrontCertificateArn) !== 'us-east-1') {
    problems.push('cloudFrontCertificateArn must be an ACM certificate ARN in us-east-1');
  }
  if (acmRegion(albCertificateArn) !== region) {
    problems.push(`albCertificateArn must be an ACM certificate ARN in ${region}`);
  }
  if (activeRaw !== 'a' && activeRaw !== 'b') {
    problems.push('originVerifyActive must be "a" or "b"');
  }
  if (problems.length > 0) {
    throw new Error(`Invalid CDK context: ${problems.join('; ')}.`);
  }

  return {
    region,
    domainName,
    originDomainName: `origin.${domainName}`,
    hostedZoneId: value('hostedZoneId'),
    hostedZoneName,
    cloudFrontCertificateArn,
    albCertificateArn,
    imageTag: value('imageTag'),
    originVerifyActive: activeRaw as OriginVerifySlot,
    originVerifyVersionA: readString(read, 'originVerifyVersionA'),
    originVerifyVersionB: readString(read, 'originVerifyVersionB'),
  };
}
