// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Cart from "@/models/cart";
import { UpdateCartSchema } from "@/lib/validators/cart";
import { getSessionForRequest } from "@/lib/auth";
import { handleError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId") ?? undefined;

    let cart;
    if (session?.user?.email) {
      cart = await Cart.findOne({ user: session.user.id }).lean();
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).lean();
    } else {
      return NextResponse.json({ items: [] });
    }
    return NextResponse.json({ cart });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    const body = await req.json();
    const parsed = UpdateCartSchema.parse(body);

    if (session?.user?.id) {
      const updated = await Cart.findOneAndUpdate(
        { user: session.user.id },
        { $set: { items: parsed.items } },
        { upsert: true, new: true }
      );
      return NextResponse.json({ cart: updated });
    } else {
      // guest cart: require sessionId in URL
      const url = new URL(req.url);
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) return NextResponse.json({ error: "Missing sessionId for guest cart" }, { status: 400 });

      const updated = await Cart.findOneAndUpdate(
        { sessionId },
        { $set: { items: parsed.items } },
        { upsert: true, new: true }
      );
      return NextResponse.json({ cart: updated });
    }
  } catch (e) {
    return handleError(e);
  }
}
