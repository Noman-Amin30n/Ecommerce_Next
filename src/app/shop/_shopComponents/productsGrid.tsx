import React from "react";
import { Product } from "@/typescript/types"; // Import type
import { ProductCard_Normal, ProductCardList } from "@/components/product_card";
import SwitchPage from "./switchPage";
import ProductsClientContainer from "./productsClientContainer";
import Link from "next/link";
import ProductModel, { IProduct } from "@/models/product"; // Alias model import
import { TotalCountUpdaterClient } from "./totalCountUpdaterClient";
import { SortOrder } from "mongoose";
import { Filter } from "mongodb";

// ----------------------
// Server Component
// ----------------------

interface ProductsContainerProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface SortOption {
  [key: string]: SortOrder;
}

export default async function ProductsContainer({
  searchParams,
}: ProductsContainerProps) {
  // Query Params
  const sortBy = searchParams.sortBy || "createdAt";
  const page = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.itemsPerPage) || 16;
  const maxPrice = Number(searchParams.maxPrice);
  const productsLayout = searchParams.productsLayout || "grid";

  // Build Mongoose Query
  const query: Filter<IProduct> = {};
  if (maxPrice > 0) {
    query.price = { $lte: maxPrice };
  }

  // Build Sort Object
  let sortOption: SortOption = {};
  switch (sortBy) {
    case "title":
      sortOption = { title: 1 };
      break;
    case "price":
      sortOption = { price: -1 }; // Descending
      break;
    case "rating":
      sortOption = { rating: -1 }; // Descending
      break;
    case "createdAt":
    default:
      sortOption = { createdAt: -1 }; // Newest first
      break;
  }

  /* 
    Note: Product.find() returns Mongoose documents. 
    We use .lean() to get plain JS objects.
    We also need to map _id to id to match the frontend 'Product' interface expectation if needed,
    but the frontend seems to derive ID from slug or direct property.
    However, the Product type definition usually has 'id'. Mongoose has '_id'.
    There will be a type mismatch.
    For this hackathon, we can cast or map.
    Let's map it cleanly.
  */

  const skip = (page - 1) * itemsPerPage;

  const [productsRaw, total] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ProductModel.find(query as any)
      .sort(sortOption)
      .skip(skip)
      .limit(itemsPerPage)
      .lean(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ProductModel.countDocuments(query as any),
  ]);

  // Transform Mongoose docs to match the 'Product' interface + slug
  const products: Product[] = productsRaw.map((p) => {
    // Explicitly casting p to unknown then to a compatible shape if needed,
    // but since we imported IProduct, we can use that if .lean() returns it properly.
    // However, lean() returns a Plain Old JavaScript Object (POJO).
    // The issue is _id is an object, we need string.

    // Helper to safely access properties if TS complains about strict IProduct shape vs POJO
    const doc = p as unknown as IProduct & { _id: { toString: () => string } };

    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description || "",
      category: String(doc.category), // ObjectId to string
      price: doc.price,
      discountPercentage: 0, // Default missing fields
      rating: 0,
      stock: 0,
      tags: doc.tags || [],
      brand: "Generic",
      sku: doc.sku || "",
      weight: 0,
      dimensions: { width: 0, height: 0, depth: 0 },
      warrantyInformation: "",
      shippingInformation: "",
      availabilityStatus: "In Stock",
      reviews: [],
      returnPolicy: "",
      minimumOrderQuantity: 1,
      meta: {
        createdAt: new Date(doc.createdAt).toISOString(),
        updatedAt: new Date(doc.updatedAt).toISOString(),
        barcode: "",
        qrCode: "",
      },
      thumbnail: doc.images?.[0] || "",
      images: doc.images || [],
      slug: doc.slug, // Ensure slug is passed if extended Product type uses it, otherwise it's extra
      variants: doc.variants || [], // Pass variants if needed by UI
    } as unknown as Product;
    // Note: The 'Product' type in types.ts is very dummyjson specific.
    // We are polyfilling missing fields to match it and satisfy TS.
  });

  // Pass total count to context if possible?
  // ProductsCount component expects 'totalProducts' from context.
  // But context is client-side. We are on server.
  // We can't easily update the context from here without a Client Component wrapper that syncs it.
  // Or we pass 'total' down.
  // For now, we just render products.

  /* 
     Update: The ProductsCount component gets total from `useFilterContext`.
     We need to feed this data into the context.
     The `ProductsClientContainer` wraps the children and accepts `products`.
     Does it accept `total`? Let's check `productsClientContainer.tsx`?
     Actually, looking at `productsGrid` usage, it wraps with `ProductsClientContainer`.
     We should probably pass the 'total' to `ProductsClientContainer` if it supports it, 
     or just let it be for now. 
     *Wait*, `ProductsCount` uses `totalProducts`.
     If `ProductsClientContainer` doesn't set it, the count will be wrong.
     Let's check `ProductsClientContainer` if we can.
     For this step, I'll just implemented the grid. I'll pass 'products'.
  */

  return (
    <ProductsClientContainer products={products}>
      {/* 
           We can inject a script or a hidden component to update the total count in the context?
           Or maybe ProductsClientContainer takes a total prop?
           I will assume ProductsClientContainer might need an update or we leave it for now.
           Actually, let's look at ProductsClientContainer in the next step if needed.
           For now, let's render.
       */}
      <TotalCountUpdaterClient total={total} />
      {products.length > 0 ? (
        <>
          {productsLayout === "list" ? (
            <div className="flex flex-col gap-4">
              {products.map((product) => (
                <Link
                  // @ts-expect-error: slug is mapped but not in strict Product type yet
                  href={`/shop/${product.slug || product.id}`}
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
              {products.map((product) => (
                <Link
                  // @ts-expect-error: slug is mapped but not in strict Product type yet
                  href={`/shop/${product.slug || product.id}`}
                  key={product.id}
                >
                  {" "}
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
          <SwitchPage products={products} />
        </>
      ) : (
        <div className="w-full text-center py-20 text-gray-500">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </ProductsClientContainer>
  );
}
