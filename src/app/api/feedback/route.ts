import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSessionUser();
        const body = await req.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Feedback content is required' }, { status: 400 });
        }

        const feedback = await prisma.feedback.create({
            data: {
                content,
                userId: session?.id || null, // Optional if guest
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
        // Extremely simple MVP admin check
        const password = url.searchParams.get('pw');
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const feedbacks = await prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        return NextResponse.json(feedbacks);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
