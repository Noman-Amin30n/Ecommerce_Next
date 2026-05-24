import Product from "@/models/product";
import Order from "@/models/order";
import Review from "@/models/review";
import { connectMongoose } from "@/lib/mongoose";

export async function getLandingProducts() {
  await connectMongoose();

  const products = await Product.aggregate([
    { $match: { isPublished: true } },
    {
      $lookup: {
        from: "orders",
        let: { productId: "$_id" },
        pipeline: [
          { $unwind: "$items" },
          { $match: { $expr: { $eq: ["$items.product", "$$productId"] } } },
          { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } }
        ],
        as: "salesData"
      }
    },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews"
      }
    },
    {
      $addFields: {
        totalSold: { $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0] },
        avgRating: {
          $cond: {
            if: { $gt: [{ $size: "$reviews" }, 0] },
            then: { $avg: "$reviews.rating" },
            else: 0
          }
        }
      }
    },
    {
      $project: {
        salesData: 0,
        reviews: 0
      }
    },
    {
      $sort: { totalSold: -1, avgRating: -1, createdAt: -1 }
    }
  ]);

  return products;
}
