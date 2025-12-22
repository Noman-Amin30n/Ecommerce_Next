// models/coupon.ts
import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: Date;
  validUntil?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    maxDiscount: { type: Number },
    minOrderValue: { type: Number },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = (mongoose.models.Coupon as Model<ICoupon>) || model<ICoupon>("Coupon", CouponSchema);
export default Coupon;
