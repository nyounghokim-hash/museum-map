import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Patching User table columns...');
    const queries = [
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER';`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");`
    ];

    for (const query of queries) {
        try {
            await prisma.$executeRawUnsafe(query);
            console.log('Success:', query);
        } catch (err) {
            console.error('Failed:', query, err);
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
