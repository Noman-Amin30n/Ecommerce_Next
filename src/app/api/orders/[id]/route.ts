// src/app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import Order from "@/models/order";
import { getSessionForRequest, requireAuth, requireRole } from "@/lib/auth";
import { handleError, ApiError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDb();
    const session = await getSessionForRequest();
    requireAuth(session);

    const orderId = (await params).id;
    const order = await Order.findById(orderId).lean();
    if (!order) throw new ApiError("Order not found", 404);

    if (session.user.role !== "admin" && String(order.user) !== String(session.user.id)) {
      throw new ApiError("Forbidden", 403);
    }
    return NextResponse.json({ order });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDb();
    const session = await getSessionForRequest();
    requireRole(session, ["admin"]);

    const body = await req.json();
    if (!body.status) throw new ApiError("Missing status", 400);
    const allowed = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"];
    if (!allowed.includes(body.status)) throw new ApiError("Invalid status", 400);

    // Get the current order to check previous status
    const orderId = (await params).id;
    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) throw new ApiError("Order not found", 404);

    const previousStatus = currentOrder.status;
    const newStatus = body.status;

    // Update the order status
    const updated = await Order.findByIdAndUpdate(
      orderId, 
      { $set: { status: newStatus } }, 
      { new: true }
    );
    if (!updated) throw new ApiError("Order not found", 404);

    // Handle inventory changes based on status transitions
    const Inventory = (await import("@/models/inventory")).default;

    // When order is cancelled: restore reserved inventory
    if (newStatus === "cancelled" && previousStatus !== "cancelled") {
      for (const item of updated.items) {
        const invQuery: Record<string, unknown> = { 
          product: item.product 
        };
        if (item.variantSku) invQuery.variantSku = item.variantSku;

        // Decrease reserved, increase available quantity
        await Inventory.findOneAndUpdate(
          invQuery,
          { 
            $inc: { 
              reserved: -item.quantity,
              quantity: item.quantity
            } 
          }
        );
      }
    }

    // When order is delivered: finalize the reduction (remove from reserved, already accounted for)
    if (newStatus === "delivered" && previousStatus !== "delivered" && previousStatus !== "cancelled") {
      for (const item of updated.items) {
        const invQuery: Record<string, unknown> = { 
          product: item.product 
        };
        if (item.variantSku) invQuery.variantSku = item.variantSku;

        // Just decrease reserved (quantity was never increased when order was placed)
        await Inventory.findOneAndUpdate(
          invQuery,
          { $inc: { reserved: -item.quantity } }
        );
      }
    }

    return NextResponse.json({ order: updated });
  } catch (e) {
    return handleError(e);
  }
}
