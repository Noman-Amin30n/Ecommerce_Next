import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ApiError } from "./errors";

export async function getSessionForRequest() {
  const session = await getServerSession(authOptions as NextAuthOptions);
  return session;
}

export function requireAuth(
  session: Awaited<ReturnType<typeof getSessionForRequest>>
): asserts session is NonNullable<typeof session> & {
  user: { email: string };
} {
  if (!session?.user?.email) throw new ApiError("Authentication required", 401);
}

export function requireRole(
  session: Awaited<ReturnType<typeof getSessionForRequest>>,
  roles: Array<"admin" | "seller" | "customer">
) {
  requireAuth(session);
  const role = session?.user?.role as
    | "admin"
    | "seller"
    | "customer"
    | undefined;
  if (!role || !roles.includes(role)) throw new ApiError("Forbidden", 403);
  return session;
}
