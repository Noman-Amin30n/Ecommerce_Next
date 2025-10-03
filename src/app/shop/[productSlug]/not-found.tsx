import Footer from "@/components/footer";
import Header from "@/components/header/header";
import PageTitle from "@/components/pageTitle";
import React from "react";

function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-between items-stretch">
      <Header />
      <PageTitle title="Product Not Found" backgroundImageUrl="/images/notFoundBg.png" logoImageUrl="/images/notFoundLogo.png" className="" />
      <Footer />
    </div>
  );
}

export default NotFound;