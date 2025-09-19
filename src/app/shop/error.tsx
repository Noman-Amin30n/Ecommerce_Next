"use client";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import React, { useEffect } from "react";
import PageTitle from "@/components/pageTitle";

function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <>
      <Header className="bg-white" />
      {/* Page title */}
      <PageTitle
        title="Shop"
        backgroundImageUrl="/images/pageTitleBg.jpg"
        logoImageUrl="/images/pageTitleLogo.png"
      />
      <section className="w-full px-6 mx-auto py-9 sm:py-12 lg:py-16 text-center bg-[#FAF4F4]">
        <h2 className="text-3xl font-medium">{error.message}</h2>
        <button
          className="mt-6 mx-auto px-6 py-2 border border-black"
          onClick={() => reset()}
        >
          Try again
        </button>
      </section>
      <Footer />
    </>
  );
}

export default Error;
