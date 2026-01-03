// src/app/api/cart/merge/route.ts
import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import Cart from "@/models/cart";
import { getSessionForRequest } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { mergeCartItems } from "@/lib/cartMerge";

export async function POST(req: Request) {
  try {
    await initDb();
    const session = await getSessionForRequest();
    
    // Only authenticated users can merge carts
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { guestSessionId } = body;

    if (!guestSessionId) {
      return NextResponse.json({ error: "Missing guestSessionId" }, { status: 400 });
    }

    // Fetch guest cart
    const guestCart = await Cart.findOne({ sessionId: guestSessionId }).lean();
    
    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      // No guest cart to merge, just return success
      return NextResponse.json({ success: true, merged: false });
    }

    // Fetch or create user cart
    let userCart = await Cart.findOne({ user: session.user.id });
    
    if (!userCart) {
      // Create new user cart with guest items
      userCart = await Cart.create({
        user: session.user.id,
        items: guestCart.items,
      });
    } else {
      // Merge guest cart items into user cart
      const mergedItems = mergeCartItems(userCart.items, guestCart.items);
      userCart.items = mergedItems;
      await userCart.save();
    }

    // Delete guest cart
    await Cart.deleteOne({ sessionId: guestSessionId });

    return NextResponse.json({ 
      success: true, 
      merged: true,
      itemCount: userCart.items.length 
    });
  } catch (e) {
    return handleError(e);
  }
}
