// src/lib/pricing-utils.ts

export interface BaseCartItem {
  quantity: number;
  unitPrice: number;
  isFreeShipping?: boolean;
}

/**
 * Calculates shipping cost based on items.
 * Rules: 250 PKR per item unless it has isFreeShipping flag.
 */
export function calculateShipping(items: BaseCartItem[]): number {
  return items.reduce((total, item) => {
    if (item.isFreeShipping) {
      return total;
    }
    return total + (250 * item.quantity);
  }, 0);
}

/**
 * Calculates COD handling fee.
 * Rules: 10% of subtotal.
 */
export function calculateCodFee(subtotal: number): number {
  return subtotal * 0.1;
}

/**
 * Calculates total order amount.
 */
export function calculateTotal(
  subtotal: number,
  shipping: number,
  tax: number = 0,
  discount: number = 0,
  codFee: number = 0
): number {
  return subtotal + shipping + tax + codFee - discount;
}
