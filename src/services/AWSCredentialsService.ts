import { db } from '@/db/MyAnkiDB';
import { AWSCredentials, AWSSettings, AIGenerationErrorCode, AIGenerationError } from '@/types/ai-generation';
import { encryptCredentials, decryptCredentials, clearMemory } from '@/utils/encryption';
import { BedrockClient } from './BedrockClient';

export class AWSCredentialsService {
  private bedrockClient = new BedrockClient();

  async saveCredentials(credentials: AWSCredentials): Promise<void> {
    try {
      // 인증 정보 유효성 검사
      await this.validateCredentials(credentials);

      // 기존 설정 삭제
      await db.awsSettings.clear();

      // 새 설정 저장
      const encryptedData = encryptCredentials(JSON.stringify(credentials));
      await db.awsSettings.add({
        encryptedCredentials: encryptedData,
        region: credentials.region,
        lastUpdated: new Date(),
        isActive: true,
      });

      // 메모리에서 인증 정보 제거
      clearMemory(credentials);
    } catch (error) {
      throw new AIGenerationError(
        AIGenerationErrorCode.AWS_CREDENTIALS_INVALID,
        'Failed to save AWS credentials',
        error
      );
    }
  }

  async getCredentials(): Promise<AWSCredentials | null> {
    try {
      const settings = await db.awsSettings.orderBy('lastUpdated').reverse().first();
      if (!settings || !settings.isActive) {
        return null;
      }

      const credentialsJson = decryptCredentials(settings.encryptedCredentials);
      return JSON.parse(credentialsJson);
    } catch (error) {
      throw new AIGenerationError(
        AIGenerationErrorCode.AWS_CREDENTIALS_INVALID,
        'Failed to retrieve AWS credentials',
        error
      );
    }
  }

  async deleteCredentials(): Promise<void> {
    try {
      await db.awsSettings.clear();
    } catch (error) {
      throw new AIGenerationError(
        AIGenerationErrorCode.AWS_CREDENTIALS_INVALID,
        'Failed to delete AWS credentials',
        error
      );
    }
  }

  async testConnection(credentials?: AWSCredentials): Promise<boolean> {
    try {
      const creds = credentials || await this.getCredentials();
      if (!creds) {
        return false;
      }

      this.bedrockClient.initialize(creds);
      return await this.bedrockClient.testConnection();
    } catch (error) {
      throw new AIGenerationError(
        AIGenerationErrorCode.AWS_CONNECTION_FAILED,
        'AWS connection test failed',
        error
      );
    }
  }

  private async validateCredentials(credentials: AWSCredentials): Promise<void> {
    if (!credentials.accessKeyId || !credentials.secretAccessKey || !credentials.region) {
      throw new AIGenerationError(
        AIGenerationErrorCode.AWS_CREDENTIALS_INVALID,
        'Missing required AWS credentials'
      );
    }

    // Access Key ID 형식 검증 (AKIA로 시작하는 20자)
    if (!/^AKIA[0-9A-Z]{16}$/.test(credentials.accessKeyId)) {
      throw new AIGenerationError(
        AIGenerationErrorCode.AWS_CREDENTIALS_INVALID,
        'Invalid AWS Access Key ID format'
      );
    }

    // Secret Access Key 길이 검증 (40자)
    if (credentials.secretAccessKey.length !== 40) {
      throw new AIGenerationError(
        AIGenerationErrorCode.AWS_CREDENTIALS_INVALID,
        'Invalid AWS Secret Access Key format'
      );
    }
  }

  async isConfigured(): Promise<boolean> {
    const credentials = await this.getCredentials();
    return credentials !== null;
  }
}
