const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const museum = await prisma.museum.findUnique({
        where: { id: 'qovln1ms' },
        include: { exhibitions: true }
    });
    console.log(JSON.stringify(museum, null, 2));
    await prisma.$disconnect();
}

check();
