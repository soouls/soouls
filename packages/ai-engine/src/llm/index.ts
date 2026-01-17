import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function generateReflection(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    prompt,
  });
  return text;
}
