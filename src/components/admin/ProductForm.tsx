"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductCreateSchema,
  ProductCreateInput,
} from "@/lib/validators/product";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { Save, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductCreateInput>;
}

export default function ProductForm({
  productId,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: initialData || {
      isPublished: false,
      images: [],
      tags: [],
      colors: [],
      sizes: [],
      variants: [],
      quantity: 0,
    },
  });

  const images = watch("images") || [];
  const tags = watch("tags") || [];
  const colors = watch("colors") || [];
  const sizes = watch("sizes") || [];
  const variants = watch("variants") || [];
  const title = watch("title") || "";

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !productId) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", slug);
    }
  }, [title, productId, setValue]);

  // Auto-generate default SKU if not provided
  useEffect(() => {
    if (!productId && !initialData?.sku) {
      const defaultSku = `SKU-${Date.now()}`;
      setValue("sku", defaultSku);
    }
  }, [productId, initialData?.sku, setValue]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }

  async function onSubmit(data: ProductCreateInput) {
    setLoading(true);
    setError(null);

    try {
      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function addArrayItem(field: "tags" | "colors" | "sizes", value: string) {
    if (!value.trim()) return;
    const currentArray = watch(field) || [];
    if (!currentArray.includes(value.trim())) {
      setValue(field, [...currentArray, value.trim()]);
    }
  }

  function removeArrayItem(field: "tags" | "colors" | "sizes", index: number) {
    const currentArray = watch(field) || [];
    setValue(
      field,
      currentArray.filter((_, i) => i !== index)
    );
  }

  function addVariant() {
    const newVariant = {
      sku: `SKU-${Date.now()}`,
      title: "",
      price: 0,
      compareAtPrice: 0,
      colors: [],
      sizes: [],
      images: [],
      quantity: 0,
    };
    setValue("variants", [...variants, newVariant]);
    setExpandedVariants(new Set([...expandedVariants, variants.length]));
  }

  function removeVariant(index: number) {
    setValue(
      "variants",
      variants.filter((_, i) => i !== index)
    );
    const newExpanded = new Set(expandedVariants);
    newExpanded.delete(index);
    setExpandedVariants(newExpanded);
  }

  function toggleVariantExpanded(index: number) {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVariants(newExpanded);
  }

  function addVariantArrayItem(variantIndex: number, field: "colors" | "sizes", value: string) {
    if (!value.trim()) return;
    const variant = variants[variantIndex];
    const currentArray = variant[field] || [];
    if (!currentArray.includes(value.trim())) {
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...variant,
        [field]: [...currentArray, value.trim()],
      };
      setValue("variants", updatedVariants);
    }
  }

  function removeVariantArrayItem(variantIndex: number, field: "colors" | "sizes", itemIndex: number) {
    const variant = variants[variantIndex];
    const currentArray = variant[field] || [];
    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = {
      ...variant,
      [field]: currentArray.filter((_, i) => i !== itemIndex),
    };
    setValue("variants", updatedVariants);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {productId ? "Edit Product" : "Create Product"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                {...register("title")}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug * (Auto-generated)
              </label>
              <input
                {...register("slug")}
                type="text"
                readOnly
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
              />
              {errors.slug && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                {...register("shortDescription")}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Product Images
            </h2>
            <ImageUpload
              id="main-product-images"
              images={images}
              onChange={(newImages) => setValue("images", newImages)}
            />
            {errors.images && (
              <p className="text-sm text-red-600">{errors.images.message}</p>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Product Variants</h2>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Add Variant
              </button>
            </div>

            {variants.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No variants added. Click &quot;Add Variant&quot; to create product variants with different SKUs, prices, colors, sizes, etc.
              </p>
            )}

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleVariantExpanded(index)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedVariants.has(index) ? (
                        <ChevronUp size={20} className="text-gray-600" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        Variant {index + 1}: {variant.title || variant.sku || "Untitled"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVariant(index);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {expandedVariants.has(index) && (
                    <div className="p-4 space-y-4 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SKU *
                          </label>
                          <input
                            {...register(`variants.${index}.sku` as const)}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            {...register(`variants.${index}.title` as const)}
                            type="text"
                            placeholder="e.g., Red Large"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price *
                          </label>
                          <input
                            {...register(`variants.${index}.price` as const, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Compare At Price
                          </label>
                          <input
                            {...register(`variants.${index}.compareAtPrice` as const, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            {...register(`variants.${index}.quantity` as const, { valueAsNumber: true })}
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Variant Colors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Colors
                        </label>
                        <input
                          type="text"
                          placeholder="Add color and press Enter..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addVariantArrayItem(index, "colors", e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                        />
                        <div className="flex flex-wrap gap-2">
                          {(variant.colors || []).map((color, colorIndex) => (
                            <span
                              key={colorIndex}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                            >
                              {color}
                              <button
                                type="button"
                                onClick={() => removeVariantArrayItem(index, "colors", colorIndex)}
                                className="hover:text-purple-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Variant Sizes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sizes
                        </label>
                        <input
                          type="text"
                          placeholder="Add size and press Enter..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addVariantArrayItem(index, "sizes", e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                        />
                        <div className="flex flex-wrap gap-2">
                          {(variant.sizes || []).map((size, sizeIndex) => (
                            <span
                              key={sizeIndex}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => removeVariantArrayItem(index, "sizes", sizeIndex)}
                                className="hover:text-green-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Variant Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variant Images
                        </label>
                        <ImageUpload
                          id={`variant-${index}-images`}
                          images={variant.images || []}
                          onChange={(newImages) => {
                            const updatedVariants = [...variants];
                            updatedVariants[index] = {
                              ...variant,
                              images: newImages,
                            };
                            setValue("variants", updatedVariants);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Attributes</h2>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArrayItem("tags", e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("tags", index)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colors
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add color..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArrayItem("colors", e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("colors", index)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sizes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add size..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArrayItem("sizes", e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeArrayItem("sizes", index)}
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (PKR) *
              </label>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare at Price (PKR)
              </label>
              <input
                {...register("compareAtPrice", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Quantity
              </label>
              <input
                {...register("quantity", { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Main product inventory (separate from variants)
              </p>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Organization
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register("category")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                {...register("sku")}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Status</h2>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register("isPublished")}
                type="checkbox"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Publish product
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
