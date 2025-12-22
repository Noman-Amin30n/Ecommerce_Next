import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
}

export async function uploadToCloudinary(
    file: File,
    folder?: string
): Promise<CloudinaryUploadResult> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                folder: folder || "general",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height,
                    });
                } else {
                    reject(new Error("Upload failed: No result returned"));
                }
            }
        ).end(buffer);
    });
}

export async function deleteFromCloudinary(ImageCloudURL: string): Promise<void> {
    const publicId: string | null = extractPublicId(ImageCloudURL);
    try {
        if (!publicId) {
            throw new Error("Failed to extract public ID from Cloudinary URL");
        }
        await cloudinary.uploader.destroy(publicId);
        console.log("Successfully deleted image:", publicId);
    } catch (error) {
        console.error("Failed to delete image:", publicId, error);
        throw error;
    }
}

function extractPublicId(cloudinaryUrl: string) {
    try {
        const url = new URL(cloudinaryUrl);
        const parts = url.pathname.split('/'); // breaks into [..., 'upload', 'v<version>', 'folder', 'filename.jpg']

        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1 || parts.length < uploadIndex + 3) {
            throw new Error('Invalid Cloudinary URL format');
        }

        // Extract parts after 'upload' and 'v<version>'
        const publicIdParts = parts.slice(uploadIndex + 2); // skip 'upload' and 'v<version>'
        const lastPart = publicIdParts.pop(); // Remove filename (e.g., 12345_avatar.jpg)

        if (!lastPart) {
            throw new Error('Invalid Cloudinary URL: No filename found');
        }

        // Remove extension from last part
        const fileNameWithoutExt = lastPart.replace(/\.[^/.]+$/, '');
        publicIdParts.push(fileNameWithoutExt);

        return publicIdParts.join('/');
    } catch (err) {
        console.error('Failed to extract public ID:', (err as Error).message);
        return null;
    }
}
