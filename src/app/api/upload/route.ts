import { NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const folder = formData.get("folder") as string;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        const result = await uploadToCloudinary(file as File, folder);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const {searchParams} = new URL(req.url);
        const imageCloudURL = searchParams.get("imageCloudURL");
        if (!imageCloudURL) {
            return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
        }
        await deleteFromCloudinary(imageCloudURL);
        return NextResponse.json({message: "Image deleted successfully"}, { status: 200 });
    } catch (error) {
        console.error("Delete failed:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
