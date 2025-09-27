"use client";

import React, { useEffect } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import PageTitle from "@/components/pageTitle";
import { cn } from "@/lib/utils";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // ✅ Better error handling
    if (process.env.NODE_ENV === "development") {
      console.error("Shop page error:", error);
    }
    // In production, send to monitoring service
    // reportError(error);
  }, [error]);

  return (
    <>
      <Header className="bg-white" />

      <PageTitle
        title="Shop"
        backgroundImageUrl="/images/pageTitleBg.jpg"
        logoImageUrl="/images/pageTitleLogo.png"
      />

      <section className="w-full px-6 mx-auto py-12 lg:py-16 text-center bg-[#FAF4F4]">
        <h2 className="text-2xl sm:text-3xl font-semibold text-red-600">
          Oops! Something went wrong.
        </h2>

        {/* Friendly message instead of raw error */}
        <p className="mt-4 text-base text-gray-600">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "We encountered an unexpected error. Please try again."}
        </p>

        {error.digest && process.env.NODE_ENV === "development" && (
          <p className="mt-2 text-xs text-gray-400">
            Error digest: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          aria-label="Retry loading the shop page"
          className={cn(
            "mt-6 mx-auto px-6 py-2 border border-black rounded-md",
            "hover:bg-black hover:text-white transition-colors"
          )}
        >
          Try again
        </button>
      </section>

      <Footer />
    </>
  );
}
