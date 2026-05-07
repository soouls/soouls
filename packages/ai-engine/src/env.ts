import { createOpenAI } from '@ai-sdk/openai';

function readFirstEnv(...keys: string[]): string | null {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

export function getOpenAiApiKey(): string | null {
  return readFirstEnv('OPENAI_API_KEY');
}

export function getGeminiApiKey(): string | null {
  return readFirstEnv('GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_API_KEY');
}

export function getAnthropicApiKey(): string | null {
  return readFirstEnv('ANTHROPIC_API_KEY', 'CLAUDE_API_KEY');
}

export function getOpenAiProvider() {
  const apiKey = getOpenAiApiKey();
  return apiKey ? createOpenAI({ apiKey }) : null;
}

export function getInsightModel() {
  const openai = getOpenAiProvider();
  return openai?.('gpt-4o-mini') ?? null;
}
