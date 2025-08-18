import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { AWSCredentials, BedrockResponse, BedrockModelConfig } from '@/types/ai-generation';

export class BedrockClient {
  private client: BedrockRuntimeClient | null = null;

  initialize(credentials: AWSCredentials): void {
    this.client = new BedrockRuntimeClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  async invokeModel(prompt: string, config: BedrockModelConfig): Promise<BedrockResponse> {
    if (!this.client) {
      throw new Error('Bedrock client not initialized');
    }

    console.log('Invoking Bedrock model:', config.modelId);
    console.log('Prompt length:', prompt.length);

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: config.topP,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const command = new InvokeModelCommand({
      modelId: config.modelId,
      body: JSON.stringify(requestBody),
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      console.log('Bedrock response:', responseBody);

      return {
        content: responseBody.content[0].text,
        usage: {
          inputTokens: responseBody.usage.input_tokens,
          outputTokens: responseBody.usage.output_tokens,
        },
        metadata: {
          modelId: config.modelId,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error('Bedrock API error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.invokeModel('Test connection', {
        modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        maxTokens: 10,
        temperature: 0.1,
        topP: 0.9,
      });
      return true;
    } catch {
      return false;
    }
  }
}
