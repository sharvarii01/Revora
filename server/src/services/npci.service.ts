import {
  NPCI_LIMITS,
  TERMINAL_FAILURE_CODES,
  FAILURE_CODE_CATALOG,
} from '../constants/npciRules';
import { calculateOptimalRetryTime } from '../utils/npciCalculator';
import { generateComplianceHash } from '../utils/crypto.util';

export interface NpciComplianceEvaluation {
  isAllowed: boolean;
  verdict: 'COMPLIANT_PROCEED' | 'COMPLIANT_HALT';
  stopReason?: string;
  attemptNumber: number;
  maxAttempts: number;
  earliestAllowedTime?: Date;
  recommendedOptimalTime?: Date;
  cooldownHoursRemaining: number;
  complianceRule: string;
  complianceHash: string;
}

export class NpciComplianceService {
  /**
   * Strictly evaluates whether an AutoPay retry is compliant with NPCI Circular OC-136 & RBI e-Mandate rules.
   */
  public evaluate(params: {
    failureCode?: string;
    currentAttempts: number;
    lastAttemptTime: Date;
    mandateDueDate: Date;
    customerOptedOut?: boolean;
  }): NpciComplianceEvaluation {
    const {
      failureCode,
      currentAttempts,
      lastAttemptTime,
      mandateDueDate,
      customerOptedOut,
    } = params;

    const baseAudit = {
      evaluatedAt: new Date().toISOString(),
      failureCode: failureCode || 'UNKNOWN',
      currentAttempts,
      maxAttempts: NPCI_LIMITS.MAX_CYCLE_ATTEMPTS,
    };

    // 1. Customer Opt-Out Check
    if (customerOptedOut) {
      return {
        isAllowed: false,
        verdict: 'COMPLIANT_HALT',
        stopReason: 'STOP_CUSTOMER_OPTED_OUT',
        attemptNumber: currentAttempts,
        maxAttempts: NPCI_LIMITS.MAX_CYCLE_ATTEMPTS,
        cooldownHoursRemaining: 0,
        complianceRule: 'RBI_CUSTOMER_OPT_OUT_MANDATORY_STOP',
        complianceHash: generateComplianceHash({ ...baseAudit, stop: 'OPT_OUT' }),
      };
    }

    // 2. Terminal Bank Failure Check (ZG, U16, M4, U28, Z9)
    if (failureCode && TERMINAL_FAILURE_CODES.includes(failureCode)) {
      const meta = FAILURE_CODE_CATALOG[failureCode];
      return {
        isAllowed: false,
        verdict: 'COMPLIANT_HALT',
        stopReason: `STOP_TERMINAL_FAILURE_${failureCode}`,
        attemptNumber: currentAttempts,
        maxAttempts: NPCI_LIMITS.MAX_CYCLE_ATTEMPTS,
        cooldownHoursRemaining: 0,
        complianceRule: 'NPCI_HARD_STOP_TERMINAL_ERROR_CODE',
        complianceHash: generateComplianceHash({ ...baseAudit, stop: 'TERMINAL_CODE', failureCode }),
      };
    }

    // 3. Max Presentation Attempts Check (Limit 3)
    if (currentAttempts >= NPCI_LIMITS.MAX_CYCLE_ATTEMPTS) {
      return {
        isAllowed: false,
        verdict: 'COMPLIANT_HALT',
        stopReason: 'STOP_NPCI_LIMIT_REACHED',
        attemptNumber: currentAttempts,
        maxAttempts: NPCI_LIMITS.MAX_CYCLE_ATTEMPTS,
        cooldownHoursRemaining: 0,
        complianceRule: 'NPCI_OC136_MAX_3_ATTEMPTS_HARD_CAP',
        complianceHash: generateComplianceHash({ ...baseAudit, stop: 'MAX_ATTEMPTS_EXHAUSTED' }),
      };
    }

    // 4. Calculate Cooldown & Presentation Window
    const timeCalc = calculateOptimalRetryTime(
      lastAttemptTime,
      mandateDueDate,
      currentAttempts
    );

    if (!timeCalc.isCompliant) {
      return {
        isAllowed: false,
        verdict: 'COMPLIANT_HALT',
        stopReason: timeCalc.stopReason || 'STOP_NPCI_WINDOW_RESTRICTION',
        attemptNumber: currentAttempts,
        maxAttempts: NPCI_LIMITS.MAX_CYCLE_ATTEMPTS,
        cooldownHoursRemaining: timeCalc.cooldownHoursRemaining,
        complianceRule: 'NPCI_PRESENTATION_WINDOW_RULE',
        complianceHash: generateComplianceHash({ ...baseAudit, stop: timeCalc.stopReason }),
      };
    }

    const nextAttemptNumber = currentAttempts + 1;
    return {
      isAllowed: true,
      verdict: 'COMPLIANT_PROCEED',
      attemptNumber: nextAttemptNumber,
      maxAttempts: NPCI_LIMITS.MAX_CYCLE_ATTEMPTS,
      earliestAllowedTime: timeCalc.earliestAllowedTime,
      recommendedOptimalTime: timeCalc.recommendedOptimalTime,
      cooldownHoursRemaining: timeCalc.cooldownHoursRemaining,
      complianceRule: 'NPCI_OC136_24H_COOLDOWN_RULE',
      complianceHash: generateComplianceHash({
        ...baseAudit,
        nextAttempt: nextAttemptNumber,
        scheduledFor: timeCalc.recommendedOptimalTime.toISOString(),
      }),
    };
  }
}

export const npciService = new NpciComplianceService();
