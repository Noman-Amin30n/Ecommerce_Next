"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { ProductCreateInput } from "@/lib/validators/product";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [initialData, setInitialData] = useState<ProductCreateInput | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          // Transform the product data to match form schema
          setInitialData({
            title: data.product.title,
            slug: data.product.slug,
            description: data.product.description,
            shortDescription: data.product.shortDescription,
            price: data.product.price,
            compareAtPrice: data.product.compareAtPrice,
            category: data.product.category._id || data.product.category,
            images: data.product.images || [],
            variants: data.product.variants || [],
            tags: data.product.tags || [],
            colors: data.product.colors || [],
            sizes: data.product.sizes || [],
            sku: data.product.sku,
            quantity: data.product.quantity,
            isPublished: data.product.isPublished,
          });
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Product not found</div>
      </div>
    );
  }

  return <ProductForm productId={productId} initialData={initialData} />;
}
