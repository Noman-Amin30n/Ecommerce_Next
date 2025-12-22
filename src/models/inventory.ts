import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface InventoryRecord extends Document {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  quantity: number;
  reserved: number; // reserved for orders not yet completed
  location?: string;
  updatedAt: Date;
}

const InventorySchema = new Schema<InventoryRecord>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    reserved: { type: Number, required: true, default: 0 },
    location: { type: String },
  },
  { timestamps: true }
);

InventorySchema.index({ product: 1, variantSku: 1 }, { unique: true });

const Inventory: Model<InventoryRecord> = (mongoose.models.Inventory as Model<InventoryRecord>) || model<InventoryRecord>("Inventory", InventorySchema);
export default Inventory;