"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { CheckoutAuthDialog } from "@/features/checkout/components/CheckoutAuthDialog";
import { CheckoutForm, ShippingAddressFormValues } from "@/features/checkout/components/CheckoutForm";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { toast } from "sonner";
import { calculateShipping, calculateCodFee } from "@/lib/pricing-utils";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import PageTitle from "@/components/common/PageTitle";
import StoreFeatures from "@/components/common/StoreFeatures";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, cartCount, subtotal, loading: cartLoading, refreshCart } = useCart();
  
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setAuthDialogOpen(true);
    } else if (status === "authenticated") {
      setAuthDialogOpen(false);
    }
  }, [status]);

  useEffect(() => {
    // If cart is empty after loading, redirect to shop or cart
    if (!cartLoading && cartCount === 0) {
      toast.info("Your cart is empty. Redirecting to shop.");
      router.push("/shop");
    }
  }, [cartLoading, cartCount, router]);

  const handleSubmitOrder = async (addressData: ShippingAddressFormValues) => {
    if (!session) {
      setAuthDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Map cart items to order items schema
      const orderItems = cartItems.map(item => ({
        product: typeof item.product === "string" ? item.product : item.product._id,
        title: typeof item.product === "object" ? item.product.title : "Product Title",
        variantSku: item.variantSku,
        image: item.image || (typeof item.product === "object" ? item.product.images?.[0] : undefined),
        color: item.color?.value, // Assuming Order schema takes a string for color
        size: item.size,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }));

      const shipping = calculateShipping(cartItems.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        isFreeShipping: typeof item.product === "object" ? item.product.isFreeShipping : false
      })));

      const codFee = calculateCodFee(subtotal);

      const payload = {
        items: orderItems,
        shipping,
        tax: 0,
        discount: 0,
        codFee,
        currency: "PKR",
        shippingAddress: addressData,
        paymentMethod: "cod",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const data = await res.json();
      
      // Refresh cart context (it should be empty now)
      await refreshCart();
      
      toast.success("Order placed successfully!");
      // Redirect to success page with order ID
      router.push(`/checkout/success?orderId=${data.order._id}`);
      
    } catch (error) {
      toast.error((error as { message?: string }).message || "An error occurred while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || cartLoading) {
    return (
      <>
        <Header className="bg-white sticky top-0 z-[997] isolate" />
        <PageTitle title="Checkout" backgroundImageUrl="/images/pageTitleBg.jpg" logoImageUrl="/images/pageTitleLogo.png" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
            <div className="lg:w-1/3">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </main>
        <StoreFeatures />
        <Footer />
      </>
    );
  }

  // Prevent rendering checkout form if cart is empty or user is not auth
  if (cartCount === 0) return null;

  return (
    <>
      <Header className="bg-white sticky top-0 z-[997] isolate" />
      <PageTitle title="Checkout" backgroundImageUrl="/images/pageTitleBg.jpg" logoImageUrl="/images/pageTitleLogo.png" />
      <main className="bg-gray-50 pb-24 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-2/3 w-full">
              {status === "authenticated" ? (
                <CheckoutForm onSubmit={handleSubmitOrder} isSubmitting={isSubmitting} />
              ) : (
                <div className="bg-white p-12 rounded-xl border shadow-sm text-center">
                  <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
                  <p className="text-gray-500 mb-6">You must be logged in to securely complete your purchase.</p>
                  <button 
                    onClick={() => setAuthDialogOpen(true)}
                    className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Sign In to Continue
                  </button>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/3 w-full">
              <CheckoutSummary 
                items={cartItems} 
                subtotal={subtotal} 
              />
            </div>
          </div>
        </div>

        <CheckoutAuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen} 
        />
      </main>
      <StoreFeatures />
      <Footer />
    </>
  );
}
