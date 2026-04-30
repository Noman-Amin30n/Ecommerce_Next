import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import Inventory from "@/models/inventory";

export async function GET(req: Request) {
  try {
    await initDb();
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    const variantSku = url.searchParams.get("variantSku");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const query: { product: string; variantSku?: string } = { product: productId };
    if (variantSku) {
      query.variantSku = variantSku;
    }

    const inv = await Inventory.findOne(query).lean();
    if (!inv) {
      // If no inventory record exists, assume out of stock or track differently.
      // Usually, it means 0 available if we strictly manage inventory.
      return NextResponse.json({ available: 0 });
    }

    const available = Math.max(0, inv.quantity - inv.reserved);
    return NextResponse.json({ available });
  } catch (error) {
    console.error("Inventory check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
