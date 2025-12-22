// scripts/seed.ts
import "dotenv/config";
import { connectMongoose } from "@/lib/mongoose";
import User from "@/models/user";
import Category from "@/models/category";
import Product from "@/models/product";

async function main() {
  await connectMongoose();
  console.log("Connected");

  // Create admin user (note: Auth.js will create user via adapter when first sign in)
  await User.findOneAndUpdate(
    { email: "admin@example.com" },
    { $setOnInsert: { name: "Admin", role: "admin", isVerified: true } },
    { upsert: true, new: true }
  );

  const cat = await Category.findOneAndUpdate(
    { slug: "uncategorized" },
    { $setOnInsert: { name: "Uncategorized", slug: "uncategorized" } },
    { upsert: true, new: true }
  );

  await Product.create({
    title: "Sample Product",
    slug: "sample-product",
    description: "This is a seeded sample product.",
    price: 19.99,
    currency: process.env.DEFAULT_CURRENCY ?? "USD",
    category: cat._id,
    images: [],
    variants: [{ sku: "SAMPLE-001", price: 19.99, quantity: 10 }],
    isPublished: true,
  });

  console.log("Seed complete");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
