import React from "react";
import { Product } from "@/typescript/types";
import { ProductCard_Normal, ProductCardList } from "@/components/product_card";
import SwitchPage from "./switchPage";
import ProductsClientContainer, { ProductsContainerFallback } from "./productsClientContainer";
import Link from "next/link";

function paginate<T>(items: T[], page: number, perPage: number) {
  const start = (page - 1) * perPage;
  const end = start + perPage > items.length ? items.length : start + perPage;
  return items.slice(start, end);
}

// ----------------------
// Server Component
// ----------------------
export default async function ProductsContainer({
  APIEndpoint,
  searchParams,
}: {
  APIEndpoint: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let products: Product[] | null = null;

  // ✅ Server-side fetch with sorting
  const sortBy = searchParams.sortBy || "createdAt";
  const page = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.itemsPerPage) || 16;
  let maxPrice = Number(searchParams.maxPrice);
  const productsLayout = searchParams.productsLayout || "grid";
  const res = await fetch(
    `${APIEndpoint}?limit=70`
  );
  if (res.ok) {
    const data: Product[] = (await res.json()).products;
    products = data.sort((a, b) => {
      if (sortBy === "title") {
        // String comparison (A–Z)
        return a.title.localeCompare(b.title);
      }

      const aVal = a[sortBy as keyof Product];
      const bVal = b[sortBy as keyof Product];

      // Handle numbers or other comparable types
      if (aVal === bVal) return 0;
      return aVal > bVal ? -1 : 1;
    });

    if (!maxPrice || maxPrice <= 0)
      maxPrice = products?.sort((a, b) => b.price - a.price)[0].price || 0;
  } else {
    throw new Error("Failed to fetch products");
  }

  // ✅ Filter + paginate
  const filteredProducts = products
    ? products.filter((p) => p.price <= maxPrice)
    : null;
  const currentPageProducts = filteredProducts
    ? paginate(filteredProducts, page, itemsPerPage)
    : null;

  return (
    <ProductsClientContainer products={currentPageProducts as Product[]}>
      {filteredProducts && currentPageProducts ? (
        <>
          {productsLayout === "list" ? (
            <div className="flex flex-col gap-4">
              {currentPageProducts.map((product) => (
                <Link
                  href={`/shop/${product.title.replaceAll(" ", "-")}-${
                    product.id
                  }`}
                  key={product.id}
                >
                  <ProductCardList
                    key={product.id}
                    imageSrc={product.images[0]}
                    imageAlt={product.title}
                    title={product.title}
                    price={product.price.toString()}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentPageProducts.map((product) => (
                <Link
                  href={`/shop/${product.title.replaceAll(" ", "-")}-${
                    product.id
                  }`}
                  key={product.id}
                >
                  <ProductCard_Normal
                    key={product.id}
                    imageSrc={product.thumbnail}
                    imageAlt={product.title}
                    title={product.title}
                    price={product.price.toString()}
                  />
                </Link>
              ))}
            </div>
          )}
          <SwitchPage
            products={filteredProducts}
          />
        </>
      ) : (
        <ProductsContainerFallback />
      )}
    </ProductsClientContainer>
  );
}
