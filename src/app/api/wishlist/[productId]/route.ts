// src/app/api/wishlist/[productId]/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Wishlist, { IWishlistItem } from "@/models/wishlist";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";

export async function DELETE(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireAuth(session);

    const productId = (await params).productId;

    const wishlist = await Wishlist.findOne({ user: session.user.id });
    if (!wishlist) {
      return NextResponse.json({ success: true }); // nothing to remove
    }

    wishlist.items = wishlist.items.filter(
      (i: IWishlistItem) => String(i.product) !== String(productId)
    );

    await wishlist.save();

    return NextResponse.json({ wishlist });
  } catch (e) {
    return handleError(e);
  }
}
