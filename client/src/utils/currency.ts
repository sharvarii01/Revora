/**
 * Indian Rupee (₹) Currency Formatter
 */
export function formatINR(amount: number, options?: { compact?: boolean; hideDecimals?: boolean }): string {
  if (isNaN(amount)) return '₹0';

  if (options?.compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options?.hideDecimals ? 0 : 2,
    maximumFractionDigits: options?.hideDecimals ? 0 : 2,
  });

  return formatter.format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
