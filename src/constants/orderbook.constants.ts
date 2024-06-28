export const ORDERBOOK_CONSTANTS = {
  MAX_ORDERS_DISPLAY: 100, // Max number of orders to display in the orderbook
} as const;

/**
 * Sorting functions for orderbook entries.
 * These functions can be used with Array.sort() to order bids and asks.
 *
 * In a typical orderbook (and in our case):
 * - Asks (sell orders) are sorted in ascending order (lowest to highest price)
 * - Bids (buy orders) are sorted in descending order (highest to lowest price)
 *
 * This way we display the best available prices at the top of each list.
 */

export const SORT_ORDERS = {
  ASCENDING: (a: number, b: number) => a - b,
  DESCENDING: (a: number, b: number) => b - a,
} as const;
