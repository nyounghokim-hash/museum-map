import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { reply } = await req.json();

        if (!reply || typeof reply !== 'string') {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        const updated = await (prisma.feedback as any).update({
            where: { id: resolvedParams.id },
            data: { reply },
            include: { user: { select: { username: true } } }
        });

        return NextResponse.json({ data: updated });
    } catch (error: any) {
        console.error('Feedback reply error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
