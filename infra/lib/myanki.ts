import { App, Validations } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { MyAnkiAppStack } from './app-stack';
import { loadConfig } from './config';
import { MyAnkiEcrStack } from './ecr-stack';

export interface MyAnkiStacks {
  readonly ecrStack: MyAnkiEcrStack;
  readonly appStack: MyAnkiAppStack;
}

/** Builds both stacks from CDK context and applies the cdk-nag AwsSolutions pack. */
export function createMyAnkiStacks(app: App): MyAnkiStacks {
  const config = loadConfig((key) => app.node.tryGetContext(key));

  // Only the region is fixed. The account comes from the deploy credentials,
  // so synth needs none and no account ID is written into the code.
  const env = { region: config.region };

  const ecrStack = new MyAnkiEcrStack(app, 'MyAnkiEcr', { env });
  const appStack = new MyAnkiAppStack(app, 'MyAnkiApp', { env, config });
  appStack.addStackDependency(ecrStack);

  Validations.of(app).addPlugins(new AwsSolutionsChecks(app, { verbose: true }));
  return { ecrStack, appStack };
}
