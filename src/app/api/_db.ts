import "@/models";
import { connectMongoose } from "@/lib/mongoose";

export async function initDb() {
    await connectMongoose();
}