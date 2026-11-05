import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

/** Fixed so the app stack can reference it by name without a stack export. */
export const REPOSITORY_NAME = 'myanki';

/**
 * Holds the app image repository. Deployed before the app stack so an image
 * can be pushed before the ECS service first starts.
 */
export class MyAnkiEcrStack extends Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, 'Repository', {
      repositoryName: REPOSITORY_NAME,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.IMMUTABLE,
      encryption: ecr.RepositoryEncryption.AES_256,
      lifecycleRules: [{ description: 'Keep the 30 newest images', maxImageCount: 30 }],
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
