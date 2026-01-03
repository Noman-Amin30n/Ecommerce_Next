// src/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import Order from "@/models/order";

export async function GET(req: Request) {
    try {
        await initDb();
        const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status") || "";
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, unknown> = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query._id = { $regex: search, $options: "i" };
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(query),
        ]);

        return NextResponse.json({
            orders,
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
