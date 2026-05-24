import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import PageTitle from "@/components/common/PageTitle";
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