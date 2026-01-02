import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName?: string;
  userEmail?: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String },
    userEmail: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 200 },
    body: { type: String, maxlength: 2000 },
    images: { type: [String], default: [], maxlength: 5 },
  },
  { timestamps: true }
);

// Index for querying reviews by product
ReviewSchema.index({ product: 1 });

// Compound unique index to ensure one review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review: Model<IReview> = (mongoose.models.Review as Model<IReview>) || model<IReview>("Review", ReviewSchema);
export default Review;
