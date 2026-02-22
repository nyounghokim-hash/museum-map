import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }
                if (credentials.username.startsWith("guest_")) {
                    // Optimized Strategy: Use the pre-created stable guest account
                    try {
                        const guestUser = await (prisma.user as any).findFirst({
                            where: { username: "guest_default" }
                        });

                        if (guestUser) {
                            return {
                                id: guestUser.id,
                                name: guestUser.name || "Guest User",
                                email: (guestUser as any).email || null,
                                role: guestUser.role || "USER"
                            };
                        }
                    } catch (err) {
                        console.error("Stable Guest Auth Error", err);
                    }

                    // Fallback to static if DB fails but this might cause issues with relation-dependent features
                    return {
                        id: "guest_fallback",
                        name: "Guest User",
                        role: "USER"
                    };
                }

                const user = await (prisma.user as any).findFirst({
                    where: { username: credentials.username }
                })

                if (!user || (!(user as any).password && !user.name)) {
                    return null
                }

                if ((user as any).password) {
                    const isPasswordValid = await bcrypt.compare(credentials.password, (user as any).password)
                    if (!isPasswordValid) return null
                } else if (credentials.password !== process.env.ADMIN_PASSWORD) {
                    return null
                }

                return {
                    id: user.id,
                    name: user.name || (user as any).username,
                    email: user.email,
                    role: user.role
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // @ts-ignore
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.id
                // @ts-ignore
                session.user.role = token.role
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
    }
})

export { handler as GET, handler as POST }
