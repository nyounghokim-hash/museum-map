import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testRegister() {
    const testUsername = 'testuser_' + Date.now();
    console.log(`Attempting to register: ${testUsername}`);
    try {
        const user = await prisma.user.create({
            data: {
                username: testUsername,
                password: 'testpassword',
                name: testUsername
            }
        });
        console.log('Registration Success:', user);
    } catch (err) {
        console.error('Registration Failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testRegister();
