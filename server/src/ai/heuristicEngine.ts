import { AIContextVector, AIReasoningOutput } from '../types/ai.types';
import {
  FAILURE_CODE_CATALOG,
  TERMINAL_FAILURE_CODES,
  NPCI_LIMITS,
} from '../constants/npciRules';
import { calculateOptimalRetryTime } from '../utils/npciCalculator';

export class HeuristicDecisionEngine {
  public evaluate(context: AIContextVector): AIReasoningOutput {
    const {
      eventType,
      failureCode,
      customerProfile,
      transactionDetails,
      merchantPolicy,
    } = context;

    // 1. Check for Terminal / Fraud Hard Stops (Bucket 3)
    if (failureCode && TERMINAL_FAILURE_CODES.includes(failureCode)) {
      const meta = FAILURE_CODE_CATALOG[failureCode];
      return {
        action: 'STOP_STATE_TERMINAL_FAILURE',
        strategyType: 'HALT_NO_RETRY',
        recommendedTimestamp: null,
        recommendedChannel: 'EMAIL_MERCHANT_NOTIFICATION',
        offerAppliedPct: null,
        recoveryScore: 5,
        riskScore: 95,
        confidence: 0.99,
        complianceRule: 'NPCI_HARD_STOP_TERMINAL_ERROR_CODE',
        headline: `Hard Stop: Terminal Bank Failure (${failureCode})`,
        rationale: `Failure code ${failureCode} (${meta?.name || 'Terminal Error'}) indicates permanent mandate or VPA cancellation. Autonomous retry queues immediately halted to prevent bank bounce penalty.`,
        merchantSummary: `Recovery stopped. Mandate marked unusable (${failureCode}).`,
        customerMessagePreview: `Hi ${customerProfile.name}, your recurring mandate could not be processed due to ${meta?.name || 'bank error'}. Please update payment method.`,
      };
    }

    // 2. Check NPCI 3-Attempt Cycle Limit Cap
    if (transactionDetails.currentAttempt >= NPCI_LIMITS.MAX_CYCLE_ATTEMPTS) {
      return {
        action: 'STOP_STATE_NPCI_LIMIT_REACHED',
        strategyType: 'HALT_AUTOPAY_FALLBACK_LINK',
        recommendedTimestamp: null,
        recommendedChannel: 'WHATSAPP_PAYMENT_LINK',
        offerAppliedPct: null,
        recoveryScore: 38,
        riskScore: 70,
        confidence: 0.99,
        complianceRule: 'NPCI_OC136_MAX_3_ATTEMPTS_HARD_CAP',
        headline: 'Autonomous Stop State: NPCI 3-Attempt Limit Reached',
        rationale: `Mandate has consumed 3/3 attempts in this billing cycle. Further debit presentations violate NPCI Circular OC-136. Switched to non-intrusive one-click Payment Link.`,
        merchantSummary: `AutoPay retries exhausted (3/3). Failsafe compliant stop enforced.`,
        customerMessagePreview: `Hi ${customerProfile.name}, your ${transactionDetails.planOrItemName} auto-debit has reached bank presentation limits. Pay safely via link: https://rzp.io/l/pay_${customerProfile.id}`,
      };
    }

    // 3. Check for Action Required (Bucket 2 - e.g. ZM MPIN error, U68 mode unsupported)
    if (failureCode && ['ZM', 'U19', 'U68'].includes(failureCode)) {
      const meta = FAILURE_CODE_CATALOG[failureCode];
      return {
        action: 'DISPATCH_SMART_PAYMENT_LINK',
        strategyType: 'MANUAL_AUTHENTICATION_LINK',
        recommendedTimestamp: null,
        recommendedChannel: 'WHATSAPP_SMART_LINK',
        offerAppliedPct: null,
        recoveryScore: 78,
        riskScore: 25,
        confidence: 0.92,
        complianceRule: 'NPCI_ACTION_REQUIRED_MANUAL_INTERVENTION',
        headline: `Action Required: Customer Re-Authentication (${failureCode})`,
        rationale: `Failure code ${failureCode} (${meta?.name}) requires customer MPIN re-entry or alternate payment mode. Dispatched instant Razorpay checkout link.`,
        merchantSummary: `Payment link sent. Auto-debit paused until customer authorization.`,
        customerMessagePreview: `Hi ${customerProfile.name}, your ${transactionDetails.planOrItemName} payment requires MPIN verification. Complete now: https://rzp.io/l/pay_${customerProfile.id}`,
      };
    }

    // 4. Handle Checkout Cart Abandonment with Dynamic Margin-Controlled Incentives
    if (eventType === 'checkout.abandoned' || transactionDetails.type === 'CHECKOUT_ABANDONMENT') {
      const discountPct = Math.min(5.0, merchantPolicy.maxDiscountPct);
      return {
        action: 'APPLY_DYNAMIC_INCENTIVE_LINK',
        strategyType: 'TIERED_CART_NUDGE',
        recommendedTimestamp: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
        recommendedChannel: 'WHATSAPP_WITH_INCENTIVE',
        offerAppliedPct: discountPct,
        recoveryScore: 84,
        riskScore: 12,
        confidence: 0.93,
        complianceRule: 'MERCHANT_MARGIN_FLOOR_POLICY',
        headline: `Dynamic ${discountPct}% Retention Incentive Applied`,
        rationale: `Cart drop-off detected. AI generated personalized Razorpay link with ${discountPct}% incentive within merchant margin limits.`,
        merchantSummary: `Cart recovery active with ${discountPct}% discount offer.`,
        customerMessagePreview: `Hi ${customerProfile.name}, complete your purchase for ${transactionDetails.planOrItemName} and enjoy ${discountPct}% off: https://rzp.io/l/cart_${customerProfile.id}`,
      };
    }

    // 5. Default Transient Failure (Bucket 1 - U30, UT, U54, ZA) -> Intelligent Scheduled Retry
    const dueDate = transactionDetails.mandateDueDate || new Date(Date.now() + 2 * 24 * 3600 * 1000);
    const npciCalc = calculateOptimalRetryTime(
      transactionDetails.lastAttemptTime,
      dueDate,
      transactionDetails.currentAttempt
    );

    const attemptNumber = transactionDetails.currentAttempt + 1;
    const isSalaryWindow = [1, 2, 3, 4, 5, 28, 29, 30, 31].includes(npciCalc.recommendedOptimalTime.getDate());
    const recoveryScore = isSalaryWindow ? 92 : 86;

    return {
      action: 'SCHEDULE_RETRY_WITH_COURTESY_NOTIFICATION',
      strategyType: 'TIMED_AUTOPAY_PRESENTATION',
      recommendedTimestamp: npciCalc.recommendedOptimalTime,
      recommendedChannel: 'WHATSAPP_COURTESY_THEN_AUTOPAY',
      offerAppliedPct: null,
      recoveryScore,
      riskScore: 14,
      confidence: 0.95,
      complianceRule: 'NPCI_OC136_24H_COOLDOWN_AND_BANKING_HOUR_OPTIMIZATION',
      headline: `Intelligent Morning AutoPay Retry Scheduled (Attempt ${attemptNumber}/3)`,
      rationale: `Failure code ${failureCode || 'U30'} indicates transient liquidity constraint. NPCI 24h cooldown enforced. Next debit scheduled for 09:15 AM banking batch. Pre-debit courtesy notification dispatched.`,
      merchantSummary: `AutoPay retry scheduled for ${npciCalc.recommendedOptimalTime.toLocaleDateString()} at 09:15 AM (Attempt ${attemptNumber}/3).`,
      customerMessagePreview: `Hi ${customerProfile.name}, your ${transactionDetails.planOrItemName} renewal of ₹${transactionDetails.amount} could not be debited. We will retry on ${npciCalc.recommendedOptimalTime.toLocaleDateString()} at 09:15 AM. Settle now: https://rzp.io/l/pay_${customerProfile.id}`,
    };
  }
}

export const heuristicEngine = new HeuristicDecisionEngine();
