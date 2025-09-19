import React from "react";
import { cookies } from "next/headers";
import { Product } from "@/typescript/types";
import {
  ProductCard_Normal,
  ProductCardList,
} from "@/components/product_card";
import SwitchPage from "./switchPage";
import  ProductsClientContainer from "./productsClientContainer";

async function ProductsContainer({ APIEndpoint }: { APIEndpoint: string }) {
  const cookieStore = await cookies();
  const sortBy = cookieStore.get("sortBy")?.value;
  const itemsPerPage = Number(cookieStore.get("itemsPerPage")?.value);
  const page = Number(cookieStore.get("page")?.value);
  const productsLayout = cookieStore.get("productsLayout")?.value;
  const maxPrice = Number(cookieStore.get("maxPrice")?.value);
  const products: Product[] = (
    await fetch(
      `${APIEndpoint}?limit=70&sortBy=${sortBy}&order=${
        sortBy === "title" ? "asc" : "desc"
      }`
    ).then((res) => res.json())
  ).products;

  const filteredProducts = products.filter(
    (product) => product.price <= maxPrice
  );
  const finalIndex = page * itemsPerPage;
  const currentPageProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    finalIndex > filteredProducts.length ? filteredProducts.length : finalIndex
  );
  
  return (
    <ProductsClientContainer>
      {productsLayout === "list" ? (
        <div className="flex flex-col justify-start items-stretch gap-4">
          {currentPageProducts.map((product) => (
            <div key={product.id}>
              <ProductCardList
                imageSrc={product.images[0]}
                imageAlt={product.title}
                title={product.title}
                price={product.price.toString()}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentPageProducts.map((product) => (
            <div key={product.id}>
              <ProductCard_Normal
                imageSrc={product.thumbnail}
                imageAlt={product.title}
                title={product.title}
                price={product.price.toString()}
              />
            </div>
          ))}
        </div>
      )}
      <SwitchPage products={filteredProducts} page={page} itemsPerPage={itemsPerPage}/>
    </ProductsClientContainer>
  );
}

export default ProductsContainer;
