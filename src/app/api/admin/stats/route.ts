// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import Product from "@/models/product";
import Order from "@/models/order";
import User from "@/models/user";

export async function GET() {
    try {
        console.log("=== /api/admin/stats called ===");
        await connectMongoose();
        console.log("MongoDB connected");

        const session = await getSessionForRequest();
        console.log("Session:", JSON.stringify(session, null, 2));

        requireAuth(session);
        console.log("Auth check passed");

        // Check if user is admin
        console.log("User role:", session.user.role);
        if (session.user.role !== "admin") {
            console.log("User is not admin, returning 403");
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        console.log("Admin check passed");

        // Get counts
        const [totalProducts, totalOrders, totalUsers, publishedProducts] =
            await Promise.all([
                Product.countDocuments(),
                Order.countDocuments(),
                User.countDocuments(),
                Product.countDocuments({ isPublished: true }),
            ]);

        // Get revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Get order status breakdown
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const statusBreakdown = ordersByStatus.reduce(
            (acc, item) => {
                acc[item._id] = item.count;
                return acc;
            },
            {} as Record<string, number>
        );

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email")
            .lean();

        return NextResponse.json({
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                publishedProducts,
                totalRevenue,
                statusBreakdown,
            },
            recentOrders,
        });
    } catch (e) {
        return handleError(e);
    }
}
