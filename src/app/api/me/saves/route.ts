import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const folderId = searchParams.get('folderId');

        const saves = await prisma.save.findMany({
            where: {
                userId: user.id,
                folderId: folderId || undefined
            },
            include: {
                museum: {
                    select: { id: true, name: true, city: true, country: true, imageUrl: true, type: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return successResponse(saves);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
        console.error('API Error /me/saves:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch saves', 500, err.message);
    }
}
