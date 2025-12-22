// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "admin" | "seller" | "customer";
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role?: "admin" | "seller" | "customer";
        // other app-specific fields
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: "admin" | "seller" | "customer";
    }
}
