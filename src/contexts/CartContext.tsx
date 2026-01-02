"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";

interface CartItem {
  product: string | { _id: string; title: string; images: string[] };
  variantSku?: string;
  image?: string;
  color?: { label: string; value: string };
  size?: string;
  quantity: number;
  unitPrice: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (index: number) => Promise<void>;
  updateQuantity: (index: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_SESSION_ID_COOKIE = "guestSessionId";

export const getOrCreateGuestSessionId = (): string => {
  let sessionId = Cookies.get(GUEST_SESSION_ID_COOKIE);
  if (!sessionId) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    sessionId = `guest_${timestamp}_${randomString}`;
    Cookies.set(GUEST_SESSION_ID_COOKIE, sessionId, { expires: 30 });
  }
  return sessionId;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getProductId = (p: CartItem["product"]) =>
    typeof p === "string" ? p : p._id;

  const prepareItemsForApi = (items: CartItem[]) =>
    items.map((i) => ({
      ...i,
      product: getProductId(i.product),
    }));

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const sessionId = Cookies.get(GUEST_SESSION_ID_COOKIE);
      const url = sessionId ? `/api/cart?sessionId=${sessionId}` : "/api/cart";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cart?.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, session]);

  const addToCart = async (item: CartItem) => {
    try {
      const sessionId = !session?.user
        ? getOrCreateGuestSessionId()
        : undefined;

      // Local optimistic update could go here, but let's keep it simple for now
      const incomingProductId = getProductId(item.product);

      const existingItemIndex = cartItems.findIndex((i) => {
        const iProductId = getProductId(i.product);
        return (
          iProductId === incomingProductId &&
          i.variantSku === item.variantSku &&
          i.color?.value === item.color?.value &&
          i.size === item.size
        );
      });

      let newItems;
      if (existingItemIndex > -1) {
        newItems = [...cartItems];
        newItems[existingItemIndex].quantity += item.quantity;
      } else {
        newItems = [...cartItems, item];
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: prepareItemsForApi(newItems),
          sessionId,
        }),
      });

      if (res.ok) {
        await fetchCart();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (index: number) => {
    try {
      const sessionId = !session?.user
        ? Cookies.get(GUEST_SESSION_ID_COOKIE)
        : undefined;
      const newItems = cartItems.filter((_, i) => i !== index);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: prepareItemsForApi(newItems),
          sessionId,
        }),
      });

      if (res.ok) {
        setCartItems(newItems);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (index: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      const sessionId = !session?.user
        ? Cookies.get(GUEST_SESSION_ID_COOKIE)
        : undefined;
      const newItems = [...cartItems];
      newItems[index].quantity = quantity;

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: prepareItemsForApi(newItems),
          sessionId,
        }),
      });

      if (res.ok) {
        setCartItems(newItems);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const cartCount = cartItems.length;
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart: fetchCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
