import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Category from "@/models/category";
import { CategoryCreateSchema } from "@/lib/validators/category";
import { getSessionForRequest, requireRole } from "@/lib/auth";
import { handleError } from "@/lib/errors";

export async function GET() {
  try {
    await connectMongoose();
    const categories = await Category.find().lean();
    return NextResponse.json({ categories });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireRole(session, ["admin", "seller"]);

    const body = await req.json();
    const parsed = CategoryCreateSchema.parse(body);
    const existing = await Category.findOne({ slug: parsed.slug });
    if (existing) return NextResponse.json({ error: "Slug exists" }, { status: 409 });
    const created = await Category.create(parsed);
    console.log("Created category:", created);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}