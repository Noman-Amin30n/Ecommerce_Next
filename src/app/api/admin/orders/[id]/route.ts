// src/app/api/admin/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import Order from "@/models/order";
import { z } from "zod";

const UpdateOrderSchema = z.object({
    status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]),
});

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongoose();
        const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const orderId = (await params).id;

        const order = await Order.findById(orderId)
            .populate("user", "name email")
            .populate("items.product", "title images")
            .lean();

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (e) {
        return handleError(e);
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongoose();
        const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { status } = UpdateOrderSchema.parse(body);

        const orderId = (await params).id;

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (e) {
        return handleError(e);
    }
}
