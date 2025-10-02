import React from "react";
import { cookies } from "next/headers";
import { Product } from "@/typescript/types";
import { ProductCard_Normal, ProductCardList } from "@/components/product_card";
import SwitchPage from "./switchPage";
import ProductsClientContainer, {
  ProductsContainerFallback,
} from "./productsClientContainer";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// ----------------------
// Helpers
// ----------------------
function parseCookies(cookieStore: ReadonlyRequestCookies) {
  return {
    sortBy: cookieStore.get("sortBy")?.value ?? "createdAt",
    itemsPerPage: Number(cookieStore.get("itemsPerPage")?.value) || 16,
    page: Number(cookieStore.get("page")?.value) || 1,
    productsLayout: cookieStore.get("productsLayout")?.value ?? "grid",
    maxPrice:
      Number(cookieStore.get("maxPrice")?.value) || Number.MAX_SAFE_INTEGER,
  };
}

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
}: {
  APIEndpoint: string;
}) {
  let products: Product[] | null = null;
  const cookieStore = await cookies();
  const { sortBy, itemsPerPage, page, productsLayout, maxPrice } =
    parseCookies(cookieStore);

  // ✅ Server-side fetch with sorting
  const res = await fetch(
    `${APIEndpoint}?limit=70&sortBy=${sortBy}&order=${
      sortBy === "title" ? "asc" : "desc"
    }`,
    { cache: "force-cache", next: { tags: ["getProducts"] } }
  );
  if (res.ok) {
    const data = await res.json();
    products = data.products;
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
    <>
      {filteredProducts && currentPageProducts ? (
        <ProductsClientContainer
          products={currentPageProducts}
        >
          {productsLayout === "list" ? (
            <div className="flex flex-col gap-4">
              {currentPageProducts.map((product) => (
                <ProductCardList
                  key={product.id}
                  imageSrc={product.images[0]}
                  imageAlt={product.title}
                  title={product.title}
                  price={product.price.toString()}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentPageProducts.map((product) => (
                <ProductCard_Normal
                  key={product.id}
                  imageSrc={product.thumbnail}
                  imageAlt={product.title}
                  title={product.title}
                  price={product.price.toString()}
                />
              ))}
            </div>
          )}
          <SwitchPage
            products={filteredProducts}
            page={page}
            itemsPerPage={itemsPerPage}
          />
        </ProductsClientContainer>
      ) : (
        <ProductsContainerFallback />
      )}
    </>
  );
}
