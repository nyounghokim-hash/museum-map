const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixGuestNames() {
    const guests = await prisma.user.findMany({ where: { username: { startsWith: 'guest_' } } });
    console.log('기존 게스트 계정:', guests.length, '개');
    let fixed = 0;
    for (const g of guests) {
        if (!g.name || !g.name.startsWith('guest_')) {
            await prisma.user.update({ where: { id: g.id }, data: { name: g.username } });
            console.log('  수정:', g.username, '(이전 name:', g.name, ')');
            fixed++;
        }
    }
    console.log('수정 완료:', fixed, '개');
    await prisma.$disconnect();
}

fixGuestNames().catch(e => { console.error(e); process.exit(1); });
