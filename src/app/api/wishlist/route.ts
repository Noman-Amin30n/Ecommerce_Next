// src/app/api/wishlist/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Wishlist, { IWishlistItem } from "@/models/wishlist";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { WishlistAddSchema } from "@/lib/validators/wishlist";

export async function GET() {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireAuth(session);

    let wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate("items.product")
      .lean();

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: session.user.id, items: [] });
    }

    return NextResponse.json({ wishlist });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireAuth(session);

    const body = await req.json();
    const { product } = WishlistAddSchema.parse(body);

    let wishlist = await Wishlist.findOne({ user: session.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: session.user.id, items: [] });
    }

    // avoid dupes
    const exists = wishlist.items.some(
      (i: IWishlistItem) => String(i.product) === String(product)
    );
    if (!exists) {
      wishlist.items.push({ product, addedAt: new Date() });
      await wishlist.save();
    }

    return NextResponse.json({ wishlist });
  } catch (e) {
    return handleError(e);
  }
}