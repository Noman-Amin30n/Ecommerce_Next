import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/header/header";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductDetailsClient from "../_shopComponents/ProductDetailsClient";
import ProductTabSection from "../_shopComponents/ProductTabSection";
import { connectMongoose } from "@/lib/mongoose";
import Product from "@/models/product";

type Props = {
  params: Promise<{ productSlug: string }>;
};

/** Plain serialisable representation of the product document */
interface PlainProduct {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: {
    color: { label: string; value: string };
    images: string[];
    sku?: string;
    price?: number;
    compareAtPrice?: number;
    quantity?: number;
    sizes: {
      size: string;
      sku: string;
      price: number;
      compareAtPrice?: number;
      quantity?: number;
    }[];
  }[];
  rating?: number;
  reviews?: { rating: number }[];
  category?: { _id: string; name: string; slug: string } | string;
  sku?: string;
  tags?: string[];
}

async function getProduct(slug: string): Promise<PlainProduct | null> {
  await connectMongoose();
  const product = await Product.findOne({ slug })
    .populate("category") // Populate category for details page
    .lean();
  if (!product) return null;
  // Serialize Mongoose document to a plain object for Client Components
  return JSON.parse(JSON.stringify(product)) as PlainProduct;
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
          </section>

          {/* Description & Reviews Tabs */}
          <section className="w-full border-t border-gray-100">
            <ProductTabSection product={product} />
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

  const description: string =
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    "Check out this amazing product!";

  const ogImages: string[] =
    product.images && product.images.length > 0 ? product.images : [];

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: ogImages,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: ogImages,
    },
  };
}

// Optional: generateStaticParams if needed, but for now we rely on dynamic rendering + DB
