import { CardGenerationRequest, GeneratedCard, CardDirection, AIGenerationErrorCode, AIGenerationError } from '@/types/ai-generation';

export class PromptBuilder {
  private static readonly PROMPT_TEMPLATES = {
    vocabulary: {
      'english-korean': `
You are an English language learning expert. Generate {count} vocabulary flashcards for the topic "{topic}" at {difficulty} level.

Requirements:
- Front: English word only
- Back: Korean meaning, pronunciation (IPA), example sentence with Korean translation
- Format: JSON array with front/back fields
- Difficulty: {difficulty} level vocabulary
- No duplicates or inappropriate content

Response format:
[
  {
    "front": "apple",
    "back": "사과\\n발음: /ˈæpəl/\\n예문: I eat an apple every day.\\n번역: 나는 매일 사과를 먹는다."
  }
]
`,
      'korean-english': `
You are an English language learning expert. Generate {count} vocabulary flashcards for the topic "{topic}" at {difficulty} level.

Requirements:
- Front: Korean word/meaning only
- Back: English word, pronunciation (IPA), example sentence with Korean translation
- Format: JSON array with front/back fields
- Difficulty: {difficulty} level vocabulary
- No duplicates or inappropriate content

Response format:
[
  {
    "front": "사과",
    "back": "apple\\n발음: /ˈæpəl/\\n예문: I eat an apple every day.\\n번역: 나는 매일 사과를 먹는다."
  }
]
`
    },
    expressions: {
      'english-korean': `
Generate {count} English expressions for "{topic}" at {difficulty} level.
- Front: English expression
- Back: Korean meaning, usage context, example with translation
- Format: JSON array with front/back fields
`,
      'korean-english': `
Generate {count} English expressions for "{topic}" at {difficulty} level.
- Front: Korean situation/context description
- Back: English expression, pronunciation, example with translation
- Format: JSON array with front/back fields
`
    },
    idioms: {
      'english-korean': `
Generate {count} English idioms related to "{topic}" at {difficulty} level.
- Front: English idiom
- Back: Korean meaning, origin/etymology, example with translation
- Format: JSON array with front/back fields
`,
      'korean-english': `
Generate {count} English idioms related to "{topic}" at {difficulty} level.
- Front: Korean meaning/situation
- Back: English idiom, origin, example with translation
- Format: JSON array with front/back fields
`
    }
  };

  buildPrompt(request: CardGenerationRequest): string {
    const directionKey = `${request.cardDirection.front}-${request.cardDirection.back}`;
    const template = PromptBuilder.PROMPT_TEMPLATES[request.cardType]?.[directionKey];
    
    if (!template) {
      throw new AIGenerationError(
        AIGenerationErrorCode.PROMPT_GENERATION_FAILED,
        `No template found for card type: ${request.cardType}, direction: ${directionKey}`
      );
    }

    return template
      .replace(/{count}/g, request.cardCount.toString())
      .replace(/{topic}/g, request.topic)
      .replace(/{difficulty}/g, request.difficulty);
  }

  validateResponse(response: string): boolean {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) && parsed.every(card => 
        typeof card === 'object' && 
        typeof card.front === 'string' && 
        typeof card.back === 'string'
      );
    } catch {
      return false;
    }
  }

  parseResponse(response: string, request: CardGenerationRequest): GeneratedCard[] {
    try {
      const parsed = JSON.parse(response);
      
      if (!this.validateResponse(response)) {
        throw new Error('Invalid response format');
      }

      return parsed.map((card: any, index: number) => ({
        id: `generated-${Date.now()}-${index}`,
        front: card.front.trim(),
        back: card.back.trim(),
        cardType: request.cardType,
        difficulty: request.difficulty,
        metadata: {
          topic: request.topic,
          generatedAt: new Date(),
          confidence: 0.8, // 기본값
          tokens: 0, // 실제 사용량은 BedrockClient에서 설정
        },
      }));
    } catch (error) {
      throw new AIGenerationError(
        AIGenerationErrorCode.RESPONSE_PARSING_FAILED,
        'Failed to parse AI response',
        error
      );
    }
  }

  getPromptTemplate(cardType: string, direction: CardDirection): string {
    const directionKey = `${direction.front}-${direction.back}`;
    return PromptBuilder.PROMPT_TEMPLATES[cardType]?.[directionKey] || '';
  }
}
