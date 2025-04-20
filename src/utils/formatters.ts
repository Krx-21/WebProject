/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Format a number as currency (Thai Baht)
 * @param amount The amount to format
 * @returns Formatted currency string (e.g., "฿1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate the number of days between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns Number of days
 */
export function calculateDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
