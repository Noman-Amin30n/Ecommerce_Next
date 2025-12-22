// models/category.ts
import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: { unique: true } },
    description: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

const Category: Model<ICategory> = (mongoose.models.Category as Model<ICategory>) || model<ICategory>("Category", CategorySchema);
export default Category;
