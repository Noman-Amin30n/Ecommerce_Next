// models/product.ts
import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface SizeVariant {
  size: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantity?: number;
}

export interface Variant {
  color: {
    label: string;
    value: string;
  };
  images: string[];
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  sizes: SizeVariant[];
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  category: mongoose.Types.ObjectId;
  images: string[];
  variants: Variant[];
  tags: string[];
  colors?: {
    label: string;
    value: string;
  }[];
  sizes?: string[];
  sku?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  searchKeywords?: string[];
}

const ColorSchema = new Schema(
  {
    label: { type: String },
    value: { type: String },
  },
  { _id: false }
);

const SizeVariantSchema = new Schema<SizeVariant>(
  {
    size: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    quantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const VariantSchema = new Schema<Variant>(
  {
    color: { type: ColorSchema, required: true },
    images: { type: [String], default: [] },
    sku: { type: String },
    price: { type: Number },
    compareAtPrice: { type: Number },
    quantity: { type: Number, default: 0 },
    sizes: { type: [SizeVariantSchema], default: [] },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, index: { unique: true } },
    description: { type: String },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    currency: { type: String, required: true, default: process.env.DEFAULT_CURRENCY ?? "PKR" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    tags: { type: [String], default: [] },
    colors: {
      type: [ColorSchema],
      default: [],
    },
    sizes: { type: [String], default: [] },
    sku: { type: String },
    isPublished: { type: Boolean, default: false },
    searchKeywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text", searchKeywords: "text" });

const Product: Model<IProduct> = (mongoose.models.Product as Model<IProduct>) || model<IProduct>("Product", ProductSchema);
export default Product;
