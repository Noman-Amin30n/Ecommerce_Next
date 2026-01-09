import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    console.log("Middleware running on:", pathname);

    // Protect admin routes
    /* if (pathname.startsWith("/admin")) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            console.log("No token found - redirecting to /");
            return NextResponse.redirect(new URL("/account", request.url));
        }

        if (token.role !== "admin") {
            console.log(`User role is '${token.role}', not 'admin' - redirecting to /`);
            return NextResponse.redirect(new URL("/", request.url));
        }

        console.log("Admin access granted!");
    } */

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
