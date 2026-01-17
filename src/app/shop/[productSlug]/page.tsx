import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/header/header";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductDetailsClient from "../_shopComponents/ProductDetailsClient";
import { connectMongoose } from "@/lib/mongoose";
import Product from "@/models/product";

type Props = {
  params: Promise<{ productSlug: string }>;
};

async function getProduct(slug: string) {
  await connectMongoose();
  const product = await Product.findOne({ slug })
    .populate("category") // Changed to populate category for details page
    .lean();
  if (!product) return null;
  // Serialize Mongoose document to plain object for Client Component
  return JSON.parse(JSON.stringify(product));
}

export default async function Page({ params }: Props) {
  const { productSlug } = await params;
  const product = await getProduct(productSlug);

  if (!product) return notFound();

  return (
    <>
      <Header className="bg-white" />

      {/* Product Gallery and Info */}
      <main className="px-6 border-b border-b-[#D9D9D9]">
        <section className="w-full max-w-[1440px] mx-auto flex flex-col items-stretch">
          {/* Breadcrumbs */}
          <section className="min-h-14 md:min-h-[100px] flex items-center">
            <Breadcrumbs forPage="singleProduct" productTitle={product.title} />
          </section>

          {/* Product Details Client Component */}
          <section className="w-full">
            <ProductDetailsClient product={product} />
            <div className="w-full h-[100vh]"></div>
          </section>
        </section>
      </main>
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const product = await getProduct(productSlug);
  if (!product) {
    return {
      title: "Product Not Found",
      description: "No product found.",
    };
  }

  const description =
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    "Check out this amazing product!";

  return {
    title: product.title,
    description: description,
    openGraph: {
      title: product.title,
      description: description,
      images: product.images && product.images.length > 0 ? product.images : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: description,
      images: product.images && product.images.length > 0 ? product.images : [],
    },
  };
}

// Optional: generateStaticParams if needed, but for now we rely on dynamic rendering + DB
