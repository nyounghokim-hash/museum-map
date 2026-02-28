import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSessionUser();
        const body = await req.json();
        const { content, type, category, targetId, targetName } = body;

        if (!content) {
            return NextResponse.json({ error: 'Feedback content is required' }, { status: 400 });
        }

        const feedback = await prisma.feedback.create({
            data: {
                content,
                type: type || 'general',
                category: category || null,
                targetId: targetId || null,
                targetName: targetName || null,
                userId: session?.id || null,
            },
        });

        return NextResponse.json(feedback, { status: 201 });
    } catch (error) {
        console.error('Error creating feedback:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const password = url.searchParams.get('pw');
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const typeFilter = url.searchParams.get('type');
        const where = typeFilter ? { type: typeFilter } : {};

        const feedbacks = await prisma.feedback.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        return NextResponse.json(feedbacks);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
