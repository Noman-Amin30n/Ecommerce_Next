// models/product.ts
import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface Variant {
  sku: string;
  title?: string;
  price: number;
  compareAtPrice?: number;
  color?: string;
  size?: string;
  images?: string[];
  quantity?: number;
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
  colors?: string[];
  sizes?: string[];
  sku?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  searchKeywords?: string[];
}

const VariantSchema = new Schema<Variant>(
  {
    sku: { type: String, required: true },
    title: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    color: { type: String },
    size: { type: String },
    images: { type: [String], default: [] },
    quantity: { type: Number, default: 0 },
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
    colors: { type: [String], default: [] },
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
