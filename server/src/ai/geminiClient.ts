import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import logger from '../logs/logger';

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiModel() {
  if (!env.GEMINI_API_KEY) {
    return null;
  }

  if (!genAI) {
    try {
      genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    } catch (err) {
      logger.warn({ err }, '⚠️ Could not initialize Gemini SDK. Using deterministic AI heuristic.');
      return null;
    }
  }

  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}
