import "dotenv/config"
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

declare global {
    // eslint-disable-next-line no-var
    var _mongoose: {
        conn?: typeof mongoose | null;
        promise?: Promise<typeof mongoose> | null;
    } | undefined;
}

if (!global._mongoose) global._mongoose = { conn: null, promise: null };

export async function connectMongoose(): Promise<typeof mongoose> {
    if (!global._mongoose) {
        global._mongoose = { conn: null, promise: null };
    }

    if (global._mongoose.conn) {
        return global._mongoose.conn;
    }

    if (!global._mongoose.promise) {
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        };

        global._mongoose.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
            console.log("✅ MongoDB connected successfully");
            return mongoose;
        }).catch((error) => {
            console.error("❌ MongoDB connection error:", error);
            global._mongoose!.promise = null; // Reset promise on error
            throw error;
        });
    }

    global._mongoose.conn = await global._mongoose.promise;
    return global._mongoose.conn;
}
