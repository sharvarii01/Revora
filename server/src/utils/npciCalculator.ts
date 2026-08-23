import { NPCI_LIMITS } from '../constants/npciRules';

export interface NpciCalculationResult {
  isCompliant: boolean;
  earliestAllowedTime: Date;
  recommendedOptimalTime: Date;
  cooldownHoursRemaining: number;
  stopReason?: string;
}

/**
 * Calculates the exact legal earliest and statistically optimal retry time
 * according to NPCI Circular OC-136.
 */
export function calculateOptimalRetryTime(
  lastAttemptTime: Date,
  mandateCycleDueDate: Date,
  currentAttempts: number
): NpciCalculationResult {
  const now = new Date();
  const minCooldownMs = NPCI_LIMITS.MIN_COOLDOWN_HOURS * 3600 * 1000;
  const earliestAllowedTime = new Date(lastAttemptTime.getTime() + minCooldownMs);

  const msRemaining = earliestAllowedTime.getTime() - now.getTime();
  const cooldownHoursRemaining = Math.max(0, parseFloat((msRemaining / (3600 * 1000)).toFixed(1)));

  // 1. Check max attempt limit
  if (currentAttempts >= NPCI_LIMITS.MAX_CYCLE_ATTEMPTS) {
    return {
      isCompliant: false,
      earliestAllowedTime,
      recommendedOptimalTime: earliestAllowedTime,
      cooldownHoursRemaining,
      stopReason: 'NPCI_MAX_CYCLE_ATTEMPTS_EXHAUSTED_LIMIT_3',
    };
  }

  // 2. Check Mandate presentation window (T+3 business days max)
  const maxCycleWindow = new Date(
    mandateCycleDueDate.getTime() + NPCI_LIMITS.MAX_PRESENTATION_WINDOW_DAYS * 24 * 3600 * 1000
  );

  if (earliestAllowedTime > maxCycleWindow) {
    return {
      isCompliant: false,
      earliestAllowedTime,
      recommendedOptimalTime: earliestAllowedTime,
      cooldownHoursRemaining,
      stopReason: 'NPCI_PRESENTATION_WINDOW_EXPIRED_T_PLUS_3',
    };
  }

  // 3. Optimize presentation time for banking settlement batch (09:15 AM)
  const recommendedOptimalTime = new Date(earliestAllowedTime);
  const targetHour = 9;
  const targetMinute = 15;

  if (recommendedOptimalTime.getHours() < targetHour || (recommendedOptimalTime.getHours() === targetHour && recommendedOptimalTime.getMinutes() < targetMinute)) {
    recommendedOptimalTime.setHours(targetHour, targetMinute, 0, 0);
  } else {
    // If earliest is already past 9:15 AM today, push to 09:15 AM next morning for maximum liquidity success
    recommendedOptimalTime.setDate(recommendedOptimalTime.getDate() + 1);
    recommendedOptimalTime.setHours(targetHour, targetMinute, 0, 0);
  }

  return {
    isCompliant: true,
    earliestAllowedTime,
    recommendedOptimalTime,
    cooldownHoursRemaining,
  };
}
