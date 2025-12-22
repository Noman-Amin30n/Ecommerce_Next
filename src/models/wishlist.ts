import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWishlistItem {
  product: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: Types.ObjectId;
  items: IWishlistItem[];
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);

const Wishlist =
  mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
