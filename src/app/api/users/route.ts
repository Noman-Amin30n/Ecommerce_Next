import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import User from "@/models/user";
import { UpdateProfileSchema } from "@/lib/validators/user";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError, ApiError } from "@/lib/errors";

export async function GET() {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireAuth(session);
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) throw new ApiError("User not found", 404);
    return NextResponse.json({ user });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireAuth(session);

    const body = await req.json();
    const parsed = UpdateProfileSchema.parse(body);

    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: parsed },
      { new: true }
    ).lean();

    if (!updated) throw new ApiError("User not found", 404);
    return NextResponse.json({ user: updated });
  } catch (e) {
    return handleError(e);
  }
}
