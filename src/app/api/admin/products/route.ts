import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import Product from "@/models/product";
import { ProductCreateSchema } from "@/lib/validators/product";

export async function GET(req: Request) {
    try {
        await connectMongoose();
        const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const published = searchParams.get("published") || "";

        const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, unknown> = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { sku: { $regex: search, $options: "i" } },
            ];
        }
        if (category) {
            query.category = category;
        }
        if (published !== "") {
            query.isPublished = published === "true";
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate("category", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product.countDocuments(query),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: Request) {
    try {
        await connectMongoose();
        const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const data = ProductCreateSchema.parse(body);

        const product = await Product.create(data);

        // Create inventory record for main product if quantity is provided AND no variants exist
        if (
            (!data.variants || data.variants.length === 0) &&
            data.quantity !== undefined &&
            data.quantity > 0
        ) {
            const Inventory = (await import("@/models/inventory")).default;
            await Inventory.create({
                product: product._id,
                quantity: data.quantity,
                reserved: 0,
            });
        }

        // Create inventory records for variants
        if (data.variants && data.variants.length > 0) {
            const Inventory = (await import("@/models/inventory")).default;
            const variantInventoryRecords = data.variants.flatMap(v => {
                if (v.sizes && v.sizes.length > 0) {
                    return v.sizes
                        .filter(s => s.quantity !== undefined && s.quantity > 0)
                        .map(s => ({
                            product: product._id,
                            variantSku: s.sku,
                            quantity: s.quantity || 0,
                            reserved: 0,
                        }));
                } else if (v.sku && v.quantity !== undefined && v.quantity > 0) {
                    return [{
                        product: product._id,
                        variantSku: v.sku,
                        quantity: v.quantity || 0,
                        reserved: 0,
                    }];
                }
                return [];
            });
            
            if (variantInventoryRecords.length > 0) {
                await Inventory.insertMany(variantInventoryRecords);
            }
        }

        return NextResponse.json({ product }, { status: 201 });
    } catch (e) {
        return handleError(e);
    }
}

