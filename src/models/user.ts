// models/user.ts
import mongoose, { Document, Model, model, Schema } from "mongoose";

export type Role = "admin" | "seller" | "customer";

export interface Address {
  label?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  image?: string;
  role: Role;
  isVerified?: boolean;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<Address>(
  {
    label: { type: String },
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    role: { type: String, enum: ["admin", "seller", "customer"], default: "customer" },
    isVerified: { type: Boolean, default: false },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || model<IUser>("User", UserSchema);
export default User;
