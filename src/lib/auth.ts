import { prisma } from './prisma';
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                // Guest Auth logic
                if (credentials.username.startsWith("guest_")) {
                    try {
                        let user = await (prisma.user as any).findFirst({
                            where: { username: credentials.username }
                        });

                        if (!user) {
                            user = await (prisma.user as any).create({
                                data: {
                                    username: credentials.username,
                                    password: credentials.password,
                                    name: credentials.username,
                                    email: `${credentials.username}@guest.local`,
                                    role: "USER"
                                }
                            });
                        }

                        if (user) {
                            return {
                                id: user.id,
                                name: (user as any).username || credentials.username,
                                email: (user as any).email || null,
                                role: (user as any).role || "USER"
                            };
                        }
                    } catch (err) {
                        console.error("Guest Auth Error", err);
                    }
                    return null;
                }

                // Virtual Admin logic — check BEFORE DB lookup to avoid creating a user record
                if (credentials.username === 'admin' && credentials.password === process.env.ADMIN_PASSWORD) {
                    return {
                        id: 'admin-id',
                        name: 'System Admin',
                        email: 'admin@local.host',
                        role: 'ADMIN'
                    };
                }

                // Normal User Auth logic
                const user = await (prisma.user as any).findFirst({
                    where: { username: credentials.username }
                });

                if (!user || (!(user as any).password && !user.name)) {
                    return null;
                }

                if ((user as any).password) {
                    const isPasswordValid = await bcrypt.compare(credentials.password, (user as any).password);
                    if (!isPasswordValid) return null;
                } else if (credentials.password !== process.env.ADMIN_PASSWORD) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name || (user as any).username,
                    email: user.email,
                    role: user.role
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
};

export async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    // @ts-ignore
    const userId = session.user.id;
    if (userId === 'admin-id') {
        return {
            id: 'admin-id',
            username: 'admin',
            role: 'ADMIN',
            name: 'System Admin'
        };
    }
    return await prisma.user.findUnique({
        where: { id: userId }
    });
}

export async function requireAuth() {
    const user = await getSessionUser();
    if (!user) {
        throw new Error('UNAUTHORIZED');
    }
    return user;
}
