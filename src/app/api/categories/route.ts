import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import Category from "@/models/category";
import { CategoryCreateSchema } from "@/lib/validators/category";
import { getSessionForRequest, requireRole } from "@/lib/auth";
import { handleError } from "@/lib/errors";

export async function GET() {
  try {
    await initDb();
    const categories = await Category.find().populate("parent").lean();
    return NextResponse.json({ categories });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await initDb();
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