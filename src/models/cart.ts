// models/cart.ts
import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface CartItem {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  image?: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string; // for guests
  items: CartItem[];
  currency: string;
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<CartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String },
    image: { type: String },
    color: { type: String },
    size: { type: String },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    items: { type: [CartItemSchema], default: [] },
    currency: { type: String, default: process.env.DEFAULT_CURRENCY ?? "USD" },
  },
  { timestamps: true }
);

const Cart: Model<ICart> = (mongoose.models.Cart as Model<ICart>) || model<ICart>("Cart", CartSchema);
export default Cart;
