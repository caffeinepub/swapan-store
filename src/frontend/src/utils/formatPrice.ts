/**
 * Formats a numeric price value to Indian Rupee format with ₹ symbol prefix
 * @param price - The numeric price value
 * @returns Formatted price string with ₹ symbol (e.g., '₹299.00')
 */
export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}
