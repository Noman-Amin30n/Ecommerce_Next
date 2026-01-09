import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
// import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import Product from "@/models/product";
import { ProductCreateSchema } from "@/lib/validators/product";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongoose();
        /* const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        } */
        const productId = (await params).id;
        console.log("Id in the params is:", productId);

        const product = await Product.findById(productId).populate("category").lean();

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (e) {
        return handleError(e);
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongoose();
       /*  const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        } */

        const body = await req.json();
        const data = ProductCreateSchema.parse(body);
        const productId = (await params).id;

        const product = await Product.findByIdAndUpdate(productId, data, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const Inventory = (await import("@/models/inventory")).default;

        // Update main product inventory ONLY IF no variants exist
        if (data.quantity !== undefined && (!data.variants || data.variants.length === 0)) {
            await Inventory.findOneAndUpdate(
                { product: productId, variantSku: { $exists: false } },
                { 
                    product: productId,
                    quantity: data.quantity,
                },
                { upsert: true, setDefaultsOnInsert: true }
            );
        } else if (data.variants && data.variants.length > 0) {
            // If variants exist, ensure main product inventory is removed (if it was there before)
            await Inventory.deleteOne({ product: productId, variantSku: { $exists: false } });
        }

        // Sync variant inventories
        if (data.variants) {
            // Get existing inventory records for this product's variants
            const existingInventories = await Inventory.find({ 
                product: productId, 
                variantSku: { $exists: true } 
            });

            // Create a map of existing inventories by SKU
            const existingMap = new Map(
                existingInventories.map(inv => [inv.variantSku, inv])
            );

            // Update or create inventory for each size in each variant, or the variant itself if no sizes
            const allInventoryItems = data.variants.flatMap(v => {
                if (v.sizes && v.sizes.length > 0) {
                    return v.sizes.map(s => ({ sku: s.sku, quantity: s.quantity }));
                } else if (v.sku) {
                    return [{ sku: v.sku, quantity: v.quantity }];
                }
                return [];
            });

            for (const item of allInventoryItems) {
                if (item.quantity !== undefined && item.quantity >= 0 && item.sku) {
                    const existing = existingMap.get(item.sku);
                    
                    if (existing) {
                        // Update existing - preserve reserved amount
                        await Inventory.findByIdAndUpdate(existing._id, {
                            quantity: item.quantity,
                        });
                    } else {
                        // Create new inventory record
                        await Inventory.create({
                            product: productId,
                            variantSku: item.sku,
                            quantity: item.quantity,
                            reserved: 0,
                        });
                    }
                    existingMap.delete(item.sku);
                }
            }

            // Delete inventory records for removed variant SKUs
            const removedSkus = Array.from(existingMap.keys()).filter((sku): sku is string => sku !== undefined);
            if (removedSkus.length > 0) {
                await Inventory.deleteMany({
                    product: productId,
                    variantSku: { $in: removedSkus }
                });
            }
        }

        return NextResponse.json({ product });
    } catch (e) {
        return handleError(e);
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectMongoose();
       /*  const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        } */
        const productId = (await params).id;

        // First, fetch the product to get all image URLs
        const product = await Product.findById(productId);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Collect all image URLs from product and variants
        const imageUrls: string[] = [];
        
        // Add main product images
        if (product.images && product.images.length > 0) {
            imageUrls.push(...product.images);
        }

        // Add variant images
        if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
                if (variant.images && variant.images.length > 0) {
                    imageUrls.push(...variant.images);
                }
            }
        }

        // Delete all images from Cloudinary
        if (imageUrls.length > 0) {
            const { deleteFromCloudinary } = await import("@/lib/cloudinary");
            const deletePromises = imageUrls.map(async (imageUrl) => {
                try {
                    await deleteFromCloudinary(imageUrl);
                } catch (error) {
                    console.error(`Failed to delete image ${imageUrl}:`, error);
                    // Continue even if some images fail to delete
                }
            });
            
            // Wait for all deletions to complete
            await Promise.allSettled(deletePromises);
        }

        // Delete the product from database
        await Product.findByIdAndDelete(productId);

        // Also delete associated inventory records
        const Inventory = (await import("@/models/inventory")).default;
        await Inventory.deleteMany({ product: productId });

        // Also remove from all user/guest carts
        const Cart = (await import("@/models/cart")).default;
        await Cart.updateMany(
            { "items.product": productId },
            { $pull: { items: { product: productId } } }
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        return handleError(e);
    }
}
