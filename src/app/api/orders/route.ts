import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import mongoose from "mongoose";
import Order from "@/models/order";
import { CreateOrderSchema } from "@/lib/validators/order";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError, ApiError } from "@/lib/errors";
import Cart from "@/models/cart";
import Inventory from "@/models/inventory";
import { calculateShipping, calculateCodFee } from "@/lib/pricing-utils";
import Product from "@/models/product";

export async function GET() {
    try {
        await initDb();
        const session = await getSessionForRequest();
        requireAuth(session);

        // customers can get own orders, admin can get all
        if ((session.user.role as string) === "admin") {
            const orders = await Order.find().sort({ createdAt: -1 }).lean();
            return NextResponse.json({ orders });
        }

        const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ orders });
    } catch (e) {
        return handleError(e);
    }
}

export async function POST(req: Request) {
    try {
        await initDb();
        const session = await getSessionForRequest();
        requireAuth(session);

        const body = await req.json();
        const parsed = CreateOrderSchema.parse(body);

        // Calculate totals server-side (avoid trusting client)
        const subTotal = parsed.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
        
        // Fetch products to get isFreeShipping flag
        const productIds = parsed.items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        const shipping = calculateShipping(parsed.items.map(item => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            isFreeShipping: productMap.get(item.product)?.isFreeShipping ?? false
        })));

        const codFee = calculateCodFee(subTotal);
        const tax = parsed.tax ?? 0;
        const discount = parsed.discount ?? 0;
        const total = subTotal + shipping + tax + codFee - discount;

        // TODO: Use transactions to reserve inventory atomically
        // Very simple inventory check (non-transactional)
        for (const item of parsed.items) {
            const invQuery: { product: string; variantSku?: string } = { product: item.product };
            if (item.variantSku) invQuery.variantSku = item.variantSku;
            const inv = await Inventory.findOne(invQuery);
            if (inv && inv.quantity - inv.reserved < item.quantity) {
                throw new ApiError(`Insufficient stock for product ${item.title}`, 400);
            }
        }

        // Create order - convert string product IDs to ObjectId
        const orderDoc = await Order.create({
            user: session.user.id,
            items: parsed.items.map(item => ({
                product: new mongoose.Types.ObjectId(item.product),
                title: item.title,
                variantSku: item.variantSku,
                image: item.image,
                color: item.color,
                size: item.size,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                total: item.unitPrice * item.quantity,
            })),
            subTotal,
            shipping,
            tax,
            discount,
            codFee,
            total,
            currency: parsed.currency ?? process.env.DEFAULT_CURRENCY ?? "PKR",
            shippingAddress: parsed.shippingAddress,
            status: "pending",
            payment: {
                provider: "Cash on Delivery",
                status: "pending",
            },
        });

        // Reduce/reserve inventory - production: do inside transaction
        for (const item of parsed.items) {
            const invQuery: { product: string; variantSku?: string } = { product: item.product };
            if (item.variantSku) invQuery.variantSku = item.variantSku;
            await Inventory.findOneAndUpdate(invQuery, { $inc: { reserved: item.quantity } });
        }

        // Remove cart
        await Cart.deleteOne({ user: session.user.id });

        return NextResponse.json({ order: orderDoc }, { status: 201 });
    } catch (e) {
        return handleError(e);
    }
}
