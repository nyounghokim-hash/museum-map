import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [userCount, storyCount, museumCount, recentFeedback, popularStories] = await Promise.all([
            prisma.user.count({ where: { username: { not: { startsWith: 'guest_' } } } }),
            prisma.story.count({ where: { status: { not: 'DELETED' } } }),
            prisma.museum.count(),
            prisma.feedback.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } }
            }),
            prisma.story.findMany({
                take: 5,
                orderBy: { views: 'desc' },
                where: { status: 'PUBLISHED' }
            })
        ]);

        return NextResponse.json({
            data: {
                stats: {
                    users: userCount,
                    stories: storyCount,
                    museums: museumCount
                },
                recentFeedback,
                popularStories
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
