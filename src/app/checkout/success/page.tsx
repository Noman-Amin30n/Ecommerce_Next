import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import PageTitle from "@/components/pageTitle";
import StoreFeatures from "@/components/storeFeatures";

interface SuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId as string | undefined;

  return (
    <>
      <Header className="bg-white sticky top-0 z-[997] isolate" />
      <PageTitle title="Order Status" backgroundImageUrl="/images/pageTitleBg.jpg" logoImageUrl="/images/pageTitleLogo.png" />
      <main className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-12 w-full">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="text-green-500 w-20 h-20" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for your purchase. We&apos;ve received your order and are getting it ready to be shipped.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-500 mb-1">Order Reference</p>
              <p className="font-mono font-medium text-lg">{orderId}</p>
            </div>
          )}

          <div className="space-y-4">
            <Link href="/account/orders" className="block w-full">
              <Button variant="outline" className="w-full h-12 text-base">
                View Order Details
              </Button>
            </Link>
            <Link href="/shop" className="block w-full">
              <Button className="w-full h-12 text-base">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <StoreFeatures />
      <Footer />
    </>
  );
}
