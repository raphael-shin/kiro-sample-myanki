export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface CardDirection {
  front: 'english' | 'korean';
  back: 'english' | 'korean';
  description: string;
}

export interface CardGenerationRequest {
  topic: string;
  cardCount: number;
  cardType: 'vocabulary' | 'expressions' | 'idioms' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'ko' | 'en';
  cardDirection: CardDirection;
}

export interface GeneratedCard {
  id: string;
  front: string;
  back: string;
  cardType: string;
  difficulty: string;
  metadata: {
    topic: string;
    generatedAt: Date;
    confidence: number;
    tokens: number;
  };
}

export interface BedrockResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  metadata: {
    modelId: string;
    timestamp: Date;
  };
}

export interface BedrockModelConfig {
  modelId: string;
  maxTokens: number;
  temperature: number;
  topP: number;
}

export const DEFAULT_MODEL_CONFIG: BedrockModelConfig = {
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  maxTokens: 4000,
  temperature: 0.7,
  topP: 0.9,
};

export interface AIGenerationHistory {
  id?: number;
  topic: string;
  cardCount: number;
  cardType: string;
  difficulty: string;
  generatedAt: Date;
  deckId: number;
  generatedCardIds: number[];
  metadata: {
    tokensUsed: number;
    generationTime: number;
    successRate: number;
  };
}

export interface AWSSettings {
  id?: number;
  encryptedCredentials: string;
  region: string;
  lastUpdated: Date;
  isActive: boolean;
}

export enum AIGenerationErrorCode {
  AWS_CREDENTIALS_INVALID = 'AWS_CREDENTIALS_INVALID',
  AWS_CONNECTION_FAILED = 'AWS_CONNECTION_FAILED',
  BEDROCK_API_ERROR = 'BEDROCK_API_ERROR',
  PROMPT_GENERATION_FAILED = 'PROMPT_GENERATION_FAILED',
  RESPONSE_PARSING_FAILED = 'RESPONSE_PARSING_FAILED',
  CARD_VALIDATION_FAILED = 'CARD_VALIDATION_FAILED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export class AIGenerationError extends Error {
  constructor(
    public code: AIGenerationErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}
