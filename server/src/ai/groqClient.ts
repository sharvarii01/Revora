import { env } from '../config/env';
import logger from '../logs/logger';

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroqLLM(prompt: string, systemPrompt?: string): Promise<string | null> {
  const apiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    logger.warn('⚠️ No GROQ_API_KEY configured.');
    return null;
  }

  const messages: GroqChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.warn({ status: response.status, errBody }, '⚠️ Groq API responded with error status.');
      return null;
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content;
    return content || null;
  } catch (error) {
    logger.warn({ error }, '⚠️ Failed to fetch completion from Groq API.');
    return null;
  }
}
