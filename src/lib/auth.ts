import { prisma } from './prisma';

// MOCK AUTH LAYER FOR MVP
// For production, integrate next-auth User Session here
export async function getSessionUser() {
    // Using a sample user ID if seeded or creating one on the fly for MVP auth simulation
    let user = await prisma.user.findFirst({
        where: { email: 'test@example.com' }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Test Visitor',
                email: 'test@example.com',
                role: 'USER',
            }
        });
    }

    return user;
}

export async function requireAuth() {
    const user = await getSessionUser();
    if (!user) {
        throw new Error('UNAUTHORIZED');
    }
    return user;
}
