import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pw = searchParams.get('pw');

    // Simple password check for admin endpoint
    if (pw !== 'admin0724') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        // Anonymize user IDs for display
        const anonymousUsers = users.map(u => ({
            id: `usr_${u.id.substring(u.id.length - 6)}`,
            role: u.role,
            createdAt: u.createdAt,
        }));

        return NextResponse.json({ data: anonymousUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
