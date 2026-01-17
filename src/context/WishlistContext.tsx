"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import AuthDialog from "@/components/auth/AuthDialog";
import { toast } from "sonner";
import { IWishlistItem } from "@/models/wishlist";

interface WishlistContextType {
  wishlistItems: IWishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [wishlistItems, setWishlistItems] = useState<IWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  // Fetch wishlist on mount if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      const fetchWishlist = async () => {
        try {
          setIsLoading(true);
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const data = await res.json();
            setWishlistItems(data.wishlist.items || []);
          }
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [status]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (status !== "authenticated") {
        setPendingProductId(productId);
        setShowAuthDialog(true);
        return;
      }

      // Optimistic check
      // Note: We can't easily check for duplicates inside useCallback without dependency on wishlistItems
      // defaulting to check inside the set state or relying on server to handle dupes to avoid excessive dependencies
      // But for UI feedback, let's just proceed. The server handles dupes.

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: productId }),
        });

        if (res.ok) {
          const data = await res.json();
          setWishlistItems(data.wishlist.items);
          toast.success("Added to wishlist");
        } else {
          toast.error("Failed to add to wishlist");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error adding to wishlist");
      }
    },
    [status],
  );

  // If user logs in and there was a pending action
  useEffect(() => {
    if (status === "authenticated" && pendingProductId) {
      addToWishlist(pendingProductId);
      setPendingProductId(null);
    }
  }, [status, pendingProductId, addToWishlist]);

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (status !== "authenticated") return;

      // Optimistic update
      setWishlistItems((prev) =>
        prev.filter(
          (item) => String(item.product._id || item.product) !== productId,
        ),
      );

      try {
        const res = await fetch(`/api/wishlist/${productId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          toast.error("Failed to remove from wishlist");
          // Re-fetch to sync state if failed
          const fetchRes = await fetch("/api/wishlist");
          if (fetchRes.ok) {
            const data = await fetchRes.json();
            setWishlistItems(data.wishlist.items);
          }
        } else {
          toast.success("Removed from wishlist");
          // Update with server state to be sure
          const data = await res.json();
          if (data.wishlist) setWishlistItems(data.wishlist.items);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error removing from wishlist");
      }
    },
    [status],
  );

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(
      (item) => String(item.product._id || item.product) === productId,
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoading,
      }}
    >
      {children}
      <AuthDialog
        isOpen={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Login Required"
        description="Please login to add items to your wishlist."
      />
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
