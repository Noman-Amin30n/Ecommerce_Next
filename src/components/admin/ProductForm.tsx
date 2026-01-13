"use client";

import { useForm, Controller, Resolver } from "react-hook-form";
import TiptapEditor from "@/components/TiptapEditor";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductCreateSchema,
  ProductCreateInput,
} from "@/lib/validators/product";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(
    new Set()
  );

  // Store Files locally until save
  const fileMap = useRef<Map<string, File>>(new Map());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(ProductCreateSchema) as Resolver<ProductCreateInput>,
    defaultValues: {
      isPublished: false,
      images: [],
      tags: [],
      colors: [],
      sizes: [],
      variants: [],
      quantity: 0,
      price: 0,
      compareAtPrice: 0,
      ...initialData,
    },
  });

  // Handle initialData.category if it's an object (populated) or string
  useEffect(() => {
    if (initialData?.category) {
      const catValue =
        typeof initialData.category === "object" &&
        initialData.category !== null &&
        "_id" in initialData.category
          ? (initialData.category as unknown as Category)._id
          : initialData.category;

      setValue("category", catValue);
    }
  }, [initialData, setValue]);

  const tags = watch("tags") || [];

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

  // Helper: Upload file to cloudinary and return URL
  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.secure_url;
  }

  // Handle generic image changes: Convert Files to Blob URLs for preview/state
  function handleImageChange(
    newImages: (string | File)[],
    field: "images" | `variants.${number}.images`
  ) {
    const processedImages = newImages.map((item) => {
      if (typeof item === "string") return item;

      // Check if we already have a blob url for this file to avoid dups?
      // Diff to check reference equality but strict equality works for same file object from same input event usually.
      // Simpler: just create new one.
      const url = URL.createObjectURL(item);
      fileMap.current.set(url, item);
      return url;
    });

    setValue(field, processedImages, { shouldDirty: true });
  }

  async function onSubmit(data: ProductCreateInput) {
    setLoading(true);
    setError(null);

    try {
      // 1. Upload Pending Main Images
      if (data.images && data.images.length > 0) {
        const uploadedImages = await Promise.all(
          data.images.map(async (img) => {
            if (img.startsWith("blob:") && fileMap.current.has(img)) {
              const file = fileMap.current.get(img)!;
              const secureUrl = await uploadFile(file);
              // Clean up blob to free memory? optional but good practice
              URL.revokeObjectURL(img);
              fileMap.current.delete(img);
              return secureUrl;
            }
            return img;
          })
        );
        data.images = uploadedImages;
      }

      // 2. Upload Pending Variant Images
      if (data.variants && data.variants.length > 0) {
        data.variants = await Promise.all(
          data.variants.map(async (variant) => {
            if (variant.images && variant.images.length > 0) {
              const uploadedVariantImages = await Promise.all(
                variant.images.map(async (img) => {
                  if (img.startsWith("blob:") && fileMap.current.has(img)) {
                    const file = fileMap.current.get(img)!;
                    const secureUrl = await uploadFile(file);
                    URL.revokeObjectURL(img);
                    fileMap.current.delete(img);
                    return secureUrl;
                  }
                  return img;
                })
              );
              return { ...variant, images: uploadedVariantImages };
            }
            return variant;
          })
        );
      }

      // Auto-calculate top-level attributes from variants
      if (data.variants && data.variants.length > 0) {
        const distinctColors = Array.from(
          new Map(
            data.variants
              .map((v) => v.color)
              .filter(
                (c): c is { label: string; value: string } =>
                  !!c && !!c.value && !!c.label && c.label.trim() !== ""
              )
              .map((c) => [c.value, c])
          ).values()
        );

        const distinctSizes = Array.from(
          new Set(
            data.variants
              .flatMap((v) => v.sizes || [])
              .map((s) => s.size)
              .filter((s): s is string => !!s && s.trim() !== "")
          )
        );

        data.colors = distinctColors;
        data.sizes = distinctSizes;

        // Set main price and quantity from variants
        if (data.variants.length > 0) {
          const firstVariant = data.variants[0];
          const firstSize =
            firstVariant.sizes && firstVariant.sizes.length > 0
              ? firstVariant.sizes[0]
              : null;

          data.price = firstSize ? firstSize.price : firstVariant.price || 0;
          data.compareAtPrice = firstSize
            ? firstSize.compareAtPrice
            : firstVariant.compareAtPrice;
          data.sku = firstSize ? firstSize.sku : firstVariant.sku;

          let totalQuantity = 0;
          data.variants.forEach((v) => {
            if (v.sizes && v.sizes.length > 0) {
              v.sizes.forEach((s) => {
                totalQuantity += Number(s.quantity) || 0;
              });
            } else {
              totalQuantity += Number(v.quantity) || 0;
            }
          });
          data.quantity = totalQuantity;
        }

        // Collect all variant images and merge into main product images for the gallery
        const variantImages = data.variants
          .flatMap((v) => v.images || [])
          .filter((img): img is string => !!img && img.trim() !== "");

        // Filter out any duplicates
        data.images = Array.from(new Set(variantImages));
      } else {
        // If no variants, ensure images array exists
        data.images = data.images || [];
      }

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

  function addArrayItem(field: "tags" | "sizes", value: string) {
    if (!value.trim()) return;
    const currentArray = watch(field) || [];
    if (!currentArray.includes(value.trim())) {
      setValue(field, [...currentArray, value.trim()]);
    }
  }

  function removeArrayItem(field: "tags" | "sizes", index: number) {
    const currentArray = watch(field) || [];
    setValue(
      field,
      currentArray.filter((_, i) => i !== index)
    );
  }

  async function addVariant() {
    const currentImages = watch("images") || [];

    // If adding the VERY FIRST variant, clear main product images (they will be managed by variants)
    if (variants.length === 0 && currentImages.length > 0) {
      if (
        confirm(
          "Adding variants will move image management to the variant level. Main images will be cleared. Continue?"
        )
      ) {
        setValue("images", []);
      } else {
        return;
      }
    }

    const newVariant = {
      color: { label: "", value: "#000000" },
      images: [],
      sku: `SKU-${Date.now()}`,
      price: 0,
      compareAtPrice: 0,
      quantity: 0,
      sizes: [],
    };
    setValue("variants", [...variants, newVariant]);
    setExpandedVariants(new Set([...expandedVariants, variants.length]));
  }

  function addSizeToVariant(variantIndex: number) {
    const updatedVariants = [...variants];
    const currentVariant = updatedVariants[variantIndex];

    // If first size, use color-level values as defaults
    const currentSizes = currentVariant.sizes || [];
    const defaultPrice =
      currentSizes.length === 0
        ? currentVariant.price || 0
        : currentSizes[0]?.price || 0;
    const defaultCompareAtPrice =
      currentSizes.length === 0
        ? currentVariant.compareAtPrice || 0
        : currentSizes[0]?.compareAtPrice || 0;

    if (!currentVariant.sizes) {
      currentVariant.sizes = [];
    }

    currentVariant.sizes.push({
      size: "",
      sku: `${currentVariant.sku || "SKU"}-${currentVariant.sizes.length}`,
      price: defaultPrice,
      compareAtPrice: defaultCompareAtPrice,
      quantity:
        currentVariant.sizes.length === 0 ? currentVariant.quantity || 0 : 0,
    });
    setValue("variants", updatedVariants);
  }

  function removeSizeFromVariant(variantIndex: number, sizeIndex: number) {
    const updatedVariants = [...variants];
    const variant = updatedVariants[variantIndex];
    if (variant && variant.sizes) {
      variant.sizes = variant.sizes.filter((_, i) => i !== sizeIndex);
      setValue("variants", updatedVariants);
    }
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error("Form Validation Errors:", errors);
        setError("Please fix the errors in the form before submitting.");
      })}
      className="space-y-8 max-w-7xl mx-auto pb-20"
    >
      {/* Header - Sticky for better accessibility */}
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-900 hover:shadow-sm transition-all"
            title="Back to products"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              {productId ? "Edit Product" : "Create Product"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {productId
                ? `Editing unique ID: ${productId}`
                : "Add a new item to your store"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all"
          >
            {loading ? (
              <Plus className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <Trash2 size={20} className="text-red-500" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 -mx-2 px-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plus size={18} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                General Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder="e.g., Premium Leather Jacket"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600"></span>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (Auto-generated)
                </label>
                <div className="relative">
                  <input
                    {...register("slug")}
                    type="text"
                    readOnly
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500 font-mono text-sm"
                  />
                </div>
                {errors.slug && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  {...register("shortDescription")}
                  placeholder="A brief summary of the product..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description
              </label>
              <div className="prose-sm max-w-none">
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                      <TiptapEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        disabled={loading}
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Main Product Images - Only when no variants */}
            {variants.length === 0 && (
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Product Gallery *
                </label>
                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  <ImageUpload
                    id="main-product-images"
                    images={watch("images") || []}
                    onChange={(newImages) =>
                      handleImageChange(newImages, "images")
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 px-1">
                  Tip: Upload high-quality images. Recommended size:
                  1000x1000px.
                </p>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Save size={18} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Product Variants
                </h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-md"
              >
                <Plus size={18} />
                Add Color Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  <Plus size={24} />
                </div>
                <p className="text-gray-500 font-medium">
                  No variants added yet
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
                  Add variants if your product comes in multiple colors or
                  sizes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${
                      expandedVariants.has(index)
                        ? "border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-50"
                        : "border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                  >
                    {/* Variant Header */}
                    <div
                      className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors ${
                        expandedVariants.has(index)
                          ? "bg-blue-50/30"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => toggleVariantExpanded(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 group-hover:text-gray-600 transition-colors">
                          {expandedVariants.has(index) ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border border-gray-200 shadow-inner"
                            style={{
                              backgroundColor:
                                variant.color?.value || "#000000",
                            }}
                          />
                          <div>
                            <span className="font-bold text-gray-900">
                              {variant.color?.label || "New Color Variant"}
                            </span>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                              {variant.sizes?.length || 0} Sizes •{" "}
                              {variant.images?.length || 0} Images
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariant(index);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete variant"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Variant Body */}
                    {expandedVariants.has(index) && (
                      <div className="p-8 space-y-8 bg-white border-t border-blue-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Color Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                              Color Settings
                            </label>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-2">
                                  Display Name
                                </p>
                                <input
                                  {...register(
                                    `variants.${index}.color.label` as const
                                  )}
                                  type="text"
                                  placeholder="e.g., Midnight Blue"
                                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm"
                                />
                              </div>
                              <div className="flex items-end gap-3">
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500 mb-2">
                                    Hex Code
                                  </p>
                                  <Controller
                                    name={
                                      `variants.${index}.color.value` as const
                                    }
                                    control={control}
                                    render={({ field }) => (
                                      <div className="flex items-center gap-2">
                                        <div className="relative w-11 h-11 shrink-0">
                                          <input
                                            {...field}
                                            type="color"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                          />
                                          <div
                                            className="w-full h-full rounded-xl border-2 border-white shadow-md ring-1 ring-gray-200"
                                            style={{
                                              backgroundColor: field.value,
                                            }}
                                          />
                                        </div>
                                        <input
                                          {...field}
                                          type="text"
                                          placeholder="#000000"
                                          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-mono text-sm"
                                        />
                                      </div>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                              Variant Media
                            </label>
                            <p className="text-xs text-gray-500">
                              Upload images specific to this color. These will
                              be shown when customers select this color.
                            </p>
                            <div className="bg-white rounded-xl p-4 border border-gray-200 group-hover:border-blue-200 transition-all">
                              <ImageUpload
                                id={`variant-${index}-images`}
                                images={variant.images || []}
                                onChange={(newImages) =>
                                  handleImageChange(
                                    newImages,
                                    `variants.${index}.images`
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Inventory Section */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                Inventory & Pricing
                              </h3>
                              <p className="text-xs text-gray-500 italic mt-0.5">
                                {!variant.sizes || variant.sizes.length === 0
                                  ? "Managing stock at the color level."
                                  : "Managing stock by size below."}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addSizeToVariant(index)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 active:scale-95 transition-all text-xs border border-blue-100"
                            >
                              <Plus size={14} />
                              Add Size Option
                            </button>
                          </div>

                          {!variant.sizes || variant.sizes.length === 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100 shadow-inner">
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-blue-500 mb-2">
                                  Default SKU
                                </label>
                                <input
                                  {...register(
                                    `variants.${index}.sku` as const
                                  )}
                                  type="text"
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-blue-500 mb-2">
                                  Price
                                </label>
                                <input
                                  {...register(
                                    `variants.${index}.price` as const,
                                    { valueAsNumber: true }
                                  )}
                                  type="number"
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-blue-500 mb-2">
                                  Compare Price
                                </label>
                                <input
                                  {...register(
                                    `variants.${index}.compareAtPrice` as const,
                                    { valueAsNumber: true }
                                  )}
                                  type="number"
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-blue-500 mb-2">
                                  Quantity
                                </label>
                                <input
                                  {...register(
                                    `variants.${index}.quantity` as const,
                                    { valueAsNumber: true }
                                  )}
                                  type="number"
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-gray-50/30">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-gray-100/80">
                                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                                      Size
                                    </th>
                                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                                      SKU
                                    </th>
                                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                                      Price
                                    </th>
                                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500">
                                      Stock
                                    </th>
                                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-500 w-16 text-center">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {variant.sizes.map((size, sizeIndex) => (
                                    <tr
                                      key={sizeIndex}
                                      className="bg-white hover:bg-blue-50/20 transition-colors"
                                    >
                                      <td className="px-3 py-2">
                                        <input
                                          {...register(
                                            `variants.${index}.sizes.${sizeIndex}.size` as const
                                          )}
                                          type="text"
                                          placeholder="e.g. XL"
                                          className="w-full px-2 py-1.5 text-sm bg-transparent border border-transparent focus:border-blue-300 focus:bg-white rounded transition-all outline-none font-medium"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          {...register(
                                            `variants.${index}.sizes.${sizeIndex}.sku` as const
                                          )}
                                          type="text"
                                          className="w-full px-2 py-1.5 text-xs bg-transparent border border-transparent focus:border-blue-300 focus:bg-white rounded transition-all outline-none font-mono"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          {...register(
                                            `variants.${index}.sizes.${sizeIndex}.price` as const,
                                            { valueAsNumber: true }
                                          )}
                                          type="number"
                                          className="w-full px-2 py-1.5 text-sm bg-transparent border border-transparent focus:border-blue-300 focus:bg-white rounded transition-all outline-none"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          {...register(
                                            `variants.${index}.sizes.${sizeIndex}.quantity` as const,
                                            { valueAsNumber: true }
                                          )}
                                          type="number"
                                          className="w-full px-2 py-1.5 text-sm bg-transparent border border-transparent focus:border-blue-300 focus:bg-white rounded transition-all outline-none"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeSizeFromVariant(
                                              index,
                                              sizeIndex
                                            )
                                          }
                                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attributes */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Plus size={18} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Attributes & Discovery
              </h2>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                Product Tags
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Type a tag and press Enter... (e.g., Summer, New Arrival)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArrayItem("tags", e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    No tags added yet.
                  </p>
                ) : (
                  tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-lg text-xs hover:bg-gray-200 transition-colors group"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeArrayItem("tags", index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing - Hide top-level pricing when variants exist */}
          {variants.length === 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Save size={16} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Pricing</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (PKR) *
                  </label>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compare at Price
                  </label>
                  <input
                    {...register("compareAtPrice", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Inventory - Only when no variants */}
          {variants.length === 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Save size={16} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Stock</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SKU Code *
                  </label>
                  <input
                    {...register("sku")}
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    {...register("quantity", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Organization */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Plus size={16} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Organization</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <div className="relative">
                <select
                  {...register("category")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <ChevronDown size={20} />
                </div>
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* Publishing */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Save size={16} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Status</h2>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Publish Product
                </p>
                <p className="text-[10px] text-gray-500">
                  Enable to show in store
                </p>
              </div>
              <Controller
                name="isPublished"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      field.value ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        field.value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
