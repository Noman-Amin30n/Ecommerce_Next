// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import User from "@/models/user";
import { z } from "zod";

const UpdateUserSchema = z.object({
    role: z.enum(["admin", "seller", "customer"]),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await initDb();
        const session = await getSessionForRequest();
        requireAuth(session);

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Await params and destructure id
        const { id } = await params;

        const body = await req.json();
        const { role } = UpdateUserSchema.parse(body);

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (e) {
        return handleError(e);
    }
}
