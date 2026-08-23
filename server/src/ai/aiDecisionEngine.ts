import { AIContextVector, AIReasoningOutput } from '../types/ai.types';
import { callGroqLLM } from './groqClient';
import { getGeminiModel } from './geminiClient';
import { heuristicEngine } from './heuristicEngine';
import { buildGeminiPrompt } from './promptTemplates';
import logger from '../logs/logger';

export class AIDecisionEngine {
  public async evaluate(context: AIContextVector): Promise<{
    decision: AIReasoningOutput;
    modelUsed: string;
    rawPrompt?: string;
    rawOutput?: string;
  }> {
    const prompt = buildGeminiPrompt(context);

    // 1. Try Groq Llama-3.3-70b (Ultra Fast Inference)
    try {
      const groqOutput = await callGroqLLM(
        prompt,
        'You are Revora AI, an autonomous revenue recovery engine. Respond strictly with valid JSON.'
      );

      if (groqOutput) {
        const cleanedJson = groqOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        const decision: AIReasoningOutput = {
          action: parsed.action || 'SCHEDULE_RETRY',
          strategyType: parsed.strategyType || 'TIMED_AUTOPAY_PRESENTATION',
          recommendedTimestamp: parsed.recommendedTimestamp ? new Date(parsed.recommendedTimestamp) : null,
          recommendedChannel: parsed.recommendedChannel || 'WHATSAPP_COURTESY_THEN_AUTOPAY',
          offerAppliedPct: parsed.offerAppliedPct ?? null,
          recoveryScore: typeof parsed.recoveryScore === 'number' ? parsed.recoveryScore : 85,
          riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 15,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.92,
          complianceRule: parsed.complianceRule || 'NPCI_OC136_COMPLIANT',
          headline: parsed.headline || 'AI Recovery Strategy Formulated',
          rationale: parsed.rationale || 'Payment analyzed in accordance with NPCI cooldown guidelines.',
          merchantSummary: parsed.merchantSummary || 'Recovery strategy active.',
          customerMessagePreview: parsed.customerMessagePreview || 'Your subscription renewal has been scheduled.',
        };

        return {
          decision,
          modelUsed: 'Groq AI (Revora-NPCI-Engine)',
          rawPrompt: prompt,
          rawOutput: groqOutput,
        };
      }
    } catch (groqErr) {
      logger.warn({ groqErr }, '⚠️ Groq inference notice. Trying next available AI provider.');
    }

    // 2. Try Gemini Model
    const model = getGeminiModel();
    if (model) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        const decision: AIReasoningOutput = {
          action: parsed.action || 'SCHEDULE_RETRY',
          strategyType: parsed.strategyType || 'TIMED_AUTOPAY_PRESENTATION',
          recommendedTimestamp: parsed.recommendedTimestamp ? new Date(parsed.recommendedTimestamp) : null,
          recommendedChannel: parsed.recommendedChannel || 'WHATSAPP_COURTESY_THEN_AUTOPAY',
          offerAppliedPct: parsed.offerAppliedPct ?? null,
          recoveryScore: typeof parsed.recoveryScore === 'number' ? parsed.recoveryScore : 85,
          riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 15,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.92,
          complianceRule: parsed.complianceRule || 'NPCI_OC136_COMPLIANT',
          headline: parsed.headline || 'AI Recovery Strategy Formulated',
          rationale: parsed.rationale || 'Payment analyzed in accordance with NPCI cooldown guidelines.',
          merchantSummary: parsed.merchantSummary || 'Recovery strategy active.',
          customerMessagePreview: parsed.customerMessagePreview || 'Your subscription renewal has been scheduled.',
        };

        return {
          decision,
          modelUsed: 'gemini-1.5-flash',
          rawPrompt: prompt,
          rawOutput: text,
        };
      } catch (err) {
        logger.warn({ err }, '⚠️ Gemini API inference failed. Falling back to Deterministic Heuristic.');
      }
    }

    // 3. Fallback to Deterministic Heuristic Engine
    const decision = heuristicEngine.evaluate(context);
    return {
      decision,
      modelUsed: 'deterministic-heuristic-engine (NPCI Guard)',
      rawPrompt: prompt,
    };
  }
}

export const aiDecisionEngine = new AIDecisionEngine();

