import { CartItem } from "@/models/cart";

/**
 * Merges guest cart items into user cart items, avoiding duplicates.
 * A duplicate is defined as having the same product ID and variantSku.
 * 
 * @param userCartItems - Existing user cart items (takes priority)
 * @param guestCartItems - Guest cart items to merge in
 * @returns Merged array of cart items
 */

export function mergeCartItems(
  userCartItems: CartItem[],
  guestCartItems: CartItem[]
): CartItem[] {
  // Start with all user cart items
  const mergedItems = [...userCartItems];

  // Process each guest cart item
  for (const guestItem of guestCartItems) {
    // Check if this item already exists in user cart
    const isDuplicate = userCartItems.some(
      (userItem) =>
        userItem.product.toString() === guestItem.product.toString() &&
        userItem.variantSku === guestItem.variantSku
    );

    // Only add if not a duplicate
    if (!isDuplicate) {
      mergedItems.push(guestItem);
    }
  }

  return mergedItems;
}
