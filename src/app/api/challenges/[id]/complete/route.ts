import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await requireAuth();
        const { id: challengeId } = await params;

        const progress = await prisma.challengeProgress.findUnique({
            where: { userId_challengeId: { userId: user.id, challengeId } }
        });

        if (!progress) return errorResponse('NOT_FOUND', 'You have not joined this challenge yet.', 404);
        if (progress.status === 'COMPLETED') return successResponse(progress);

        // In a real scenario, we'd query the DB to check if rules are met e.g:
        // "Visited 3 museums in Europe". We simulate validation here for MVP.
        // ...

        const updated = await prisma.challengeProgress.update({
            where: { id: progress.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        return successResponse(updated);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to complete challenge', 500);
    }
}
