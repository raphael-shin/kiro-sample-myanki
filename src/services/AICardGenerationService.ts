import { db } from '@/db/MyAnkiDB';
import { 
  CardGenerationRequest, 
  GeneratedCard, 
  AWSCredentials,
  AIGenerationHistory,
  DEFAULT_MODEL_CONFIG,
  AIGenerationErrorCode,
  AIGenerationError
} from '@/types/ai-generation';
import { AWSCredentialsService } from './AWSCredentialsService';
import { BedrockClient } from './BedrockClient';
import { PromptBuilder } from './PromptBuilder';

export class AICardGenerationService {
  private credentialsService = new AWSCredentialsService();
  private bedrockClient = new BedrockClient();
  private promptBuilder = new PromptBuilder();

  async setAWSCredentials(credentials: AWSCredentials): Promise<boolean> {
    try {
      await this.credentialsService.saveCredentials(credentials);
      return true;
    } catch (error) {
      console.error('Failed to set AWS credentials:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      return await this.credentialsService.testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async generateCards(request: CardGenerationRequest): Promise<GeneratedCard[]> {
    const startTime = Date.now();
    
    try {
      // AWS 인증 정보 확인
      const credentials = await this.credentialsService.getCredentials();
      if (!credentials) {
        throw new AIGenerationError(
          AIGenerationErrorCode.AWS_CREDENTIALS_INVALID,
          'AWS credentials not configured'
        );
      }

      // Bedrock 클라이언트 초기화
      this.bedrockClient.initialize(credentials);

      // 프롬프트 생성
      const prompt = this.promptBuilder.buildPrompt(request);

      // AI 모델 호출
      const response = await this.invokeWithRetry(prompt);

      // 응답 파싱
      const generatedCards = this.promptBuilder.parseResponse(response.content, request);

      // 토큰 사용량 업데이트
      generatedCards.forEach(card => {
        card.metadata.tokens = response.usage.inputTokens + response.usage.outputTokens;
      });

      // 생성 기록 저장
      await this.saveGenerationHistory({
        topic: request.topic,
        cardCount: generatedCards.length,
        cardType: request.cardType,
        difficulty: request.difficulty,
        generatedAt: new Date(),
        deckId: 0, // 실제 저장 시 설정
        generatedCardIds: [], // 실제 저장 시 설정
        metadata: {
          tokensUsed: response.usage.inputTokens + response.usage.outputTokens,
          generationTime: Date.now() - startTime,
          successRate: 1.0,
        },
      });

      return generatedCards;
    } catch (error) {
      if (error instanceof AIGenerationError) {
        throw error;
      }
      
      throw new AIGenerationError(
        AIGenerationErrorCode.BEDROCK_API_ERROR,
        'Failed to generate cards',
        error
      );
    }
  }

  private async invokeWithRetry(prompt: string, maxRetries = 3): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.bedrockClient.invokeModel(prompt, DEFAULT_MODEL_CONFIG);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // 지수 백오프
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new AIGenerationError(
      AIGenerationErrorCode.BEDROCK_API_ERROR,
      `Failed after ${maxRetries} attempts`,
      lastError
    );
  }

  async saveGenerationHistory(history: AIGenerationHistory): Promise<void> {
    try {
      await db.aiGenerationHistory.add(history);
    } catch (error) {
      console.error('Failed to save generation history:', error);
    }
  }

  async getGenerationHistory(): Promise<AIGenerationHistory[]> {
    try {
      return await db.aiGenerationHistory
        .orderBy('generatedAt')
        .reverse()
        .limit(5)
        .toArray();
    } catch (error) {
      console.error('Failed to get generation history:', error);
      return [];
    }
  }

  async isConfigured(): Promise<boolean> {
    return await this.credentialsService.isConfigured();
  }
}
