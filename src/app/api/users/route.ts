import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import User from "@/models/user";
import { UpdateProfileSchema } from "@/lib/validators/user";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError, ApiError } from "@/lib/errors";

export async function GET() {
  try {
    await initDb();
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
    await initDb();
    const session = await getSessionForRequest();
    requireAuth(session);

    const body = await req.json();
    const parsed = UpdateProfileSchema.parse(body);

    const user = await User.findOne({ email: session.user.email });
    if (!user) throw new ApiError("User not found", 404);

    if (parsed.name) user.name = parsed.name;
    if (parsed.image) user.image = parsed.image;
    if (parsed.address) {
      const userObj = user.toObject();
      const existingAddress = userObj.address || {};

      user.address = {
        ...existingAddress,
        ...parsed.address,
      };
      user.markModified("address");
    }

    await user.save();

    return NextResponse.json({ user });
  } catch (e) {
    return handleError(e);
  }
}
