// models/review.ts
import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  body?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    body: { type: String },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1 });

const Review: Model<IReview> = (mongoose.models.Review as Model<IReview>) || model<IReview>("Review", ReviewSchema);
export default Review;
