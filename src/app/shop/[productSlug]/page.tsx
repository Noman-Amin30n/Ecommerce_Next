import React from "react";
import type { Metadata } from "next";
import { Product } from "@/typescript/types";
import { notFound } from "next/navigation";

const productsAPI =
  process.env.NEXT_PUBLIC_PRODUCTS_API || "https://dummyjson.com/products";

type Props = {
  params: Promise<{ productSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { productSlug } = await params;
  const product: Product | null = await getProduct(productSlug);
  if (!product) return notFound();

  return <div>{product.title}</div>;
}

// Fetch product data
async function getProduct(productSlug: string) {
  const productId = productSlug.split("-").pop();
  const product: Product | null = await fetch(`${productsAPI}/${productId}`).then((res) => res.json()).catch(() => null);
  if (!product || product.title.replaceAll(" ", "-") + `-${product.id}` !== productSlug) return null;
  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const product = await getProduct(productSlug);
  if (!product) {
    return {
      title: "Product Not Found",
      description: "No product ID provided.",
    };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [product.thumbnail],
    },
  };
}

// ✅ Pre-generate all possible product paths at build time
export async function generateStaticParams() {
  const res = await fetch(`${productsAPI}?limit=70`);
  const products: Product[] = (await res.json()).products;

  return products.map((product: Product) => ({
    productSlug: `${product.title.replaceAll(" ", "-")}-${product.id}`,
  }));
}
