import NextAuth, { NextAuthOptions, Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "@/lib/mongodb";
import { sendVerificationRequest as sendMagicLinkEmail } from "@/lib/mail";
import { ObjectId } from "mongodb";

const clientPromise = getMongoClient();

// NextAuth v4 configuration
export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        EmailProvider({
            server: {
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT ?? 587),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            },
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest(params) {
                // Opt: delegate to central mail util
                await sendMagicLinkEmail(params);
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    scope: "public_profile,email",
                },
            },
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account && account.provider !== "credentials") {
                // Try to find an existing user by email
                const client = await clientPromise;
                const existingUser = await client.db().collection("users").findOne({ email: user.email });
                const existingAccount = await client.db().collection("accounts").findOne({ providerAccountId: account.providerAccountId });

                if (existingUser && !existingAccount) {
                    // Link the new OAuth account to the existing user
                    await client.db().collection("accounts").insertOne({
                        provider: account.provider,
                        type: account.type,
                        providerAccountId: account.providerAccountId,
                        access_token: account.access_token,
                        token_type: account.token_type,
                        expires_at: account.expires_at,
                        scope: account.scope,
                        userId: new ObjectId(existingUser._id),
                    });
                }
            }
            
            // Handle guest cart merging on sign-in
            // Note: We can't directly access cookies in this server-side callback
            // The actual cookie removal will be handled client-side
            // This callback will merge the carts when the session is created
            
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                if (user.email === "nomankhan30n@gmail.com") {
                    token.role = "admin";
                    const client = await clientPromise;
                    await client.db().collection("users").updateOne(
                        { _id: new ObjectId(user.id) },
                        { $set: { role: "admin" } }
                    );
                } else {
                    token.role = (user as { role?: "admin" | "seller" | "customer" }).role ?? "customer";
                }
                
                // Handle cart merging on first sign-in
                // We'll set a flag that the client can check
                token.cartMerged = true;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = (token as { role?: "admin" | "seller" | "customer" }).role ?? "customer";
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
