import React from "react";
import type { Metadata } from "next";
import { Product } from "@/typescript/types";
import { notFound } from "next/navigation";
import Header from "@/components/header/header";
import Breadcrumbs from "@/components/breadcrumbs";
import ProductGallery from "@/components/productGallery";
import RatingStars from "@/components/rating";

const productsAPI =
  process.env.NEXT_PUBLIC_PRODUCTS_API || "https://dummyjson.com/products";

type Props = {
  params: Promise<{ productSlug: string }>;
};

export default async function Page({ params }: Props) {
  const { productSlug } = await params;
  const product: Product | null = await getProduct(productSlug);
  if (!product) return notFound();
  console.log(product);

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

          {/* Product Details */}
          <section className="w-full flex flex-col md:flex-row md:gap-10 xl:gap-20">
            {/* Product Gallery */}
            <ProductGallery product={product} />

            {/* Product Info */}
            <div className="basis-full md:basis-1/2 xl:pr-[200px] py-4 md:py-8">
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px]">{product.title}</h1>
              <p className="text-[#9F9F9F] font-medium text-lg md:text-xl lg:text-2xl">Rs. {product.price}</p>

              {/* Product Rating */}
              <div className="flex items-center gap-6 py-4">
                <RatingStars rating={product.rating} size={20} />
                <span className="border-l border-l-[#9F9F9F] self-stretch md:h-[30px] block"></span>
                <span className="text-xs md:text-[13px] text-[#9F9F9F]">{product.reviews.length} Customer Review</span>
              </div>

              {/* Product Description */}
              <p className="text-xs md:text-[13px] leading-normal">{product.description.length > 150 ? product.description.slice(0, 150) + "..." : product.description}</p>

              {/* Product Options */}
              <div className="flex flex-col gap-4 mt-4 md:mt-5">
                {/* Size Options */}
                <div className="space-y-2">
                  <p>Size</p>
                  <div className="flex gap-3">
                    {["L", "XL", "XS"].map((size, index) => (
                      <button key={index} className="border border-gray-300 rounded px-3 py-1">{size}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

// Fetch product data
async function getProduct(productSlug: string) {
  const productId = productSlug.split("-").pop();
  const product: Product | null = await fetch(`${productsAPI}/${productId}`)
    .then((res) => res.json())
    .catch(() => null);
  if (
    !product ||
    product.title.replaceAll(" ", "-") + `-${product.id}` !== productSlug
  )
    return null;
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
