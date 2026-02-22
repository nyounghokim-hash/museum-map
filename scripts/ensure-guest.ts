import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const guestUser = await prisma.user.upsert({
        where: { username: 'guest_default' },
        update: {},
        create: {
            username: 'guest_default',
            password: 'guest_password_secure_enough',
            name: 'Guest User',
            email: 'guest@global-museums.app', // Add dummy email to bypass possible DB constraint
            role: 'USER',
        },
    });
    console.log('Guest user ensured:', guestUser.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
