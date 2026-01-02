import mongoose, { Document, Model, Schema, model } from "mongoose";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface OrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  variantSku?: string;
  image?: string;
  color?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  items: OrderItem[];
  subTotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  payment?: {
    provider: string;
    providerId?: string;
    status?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    variantSku: { type: String },
    image: { type: String }, 
    color: { type: String },
    size: { type: String },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    items: { type: [OrderItemSchema], required: true },
    subTotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: process.env.DEFAULT_CURRENCY ?? "USD" },
    status: { type: String, enum: ["pending","paid","shipped","delivered","cancelled","refunded"], default: "pending" },
    shippingAddress: {
      fullName: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
    },
    payment: {
      provider: { type: String },
      providerId: { type: String },
      status: { type: String },
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = (mongoose.models.Order as Model<IOrder>) || model<IOrder>("Order", OrderSchema);
export default Order;