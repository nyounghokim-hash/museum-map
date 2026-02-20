import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        const { museumId, content, photos } = await req.json();

        if (!museumId || !content) {
            return errorResponse('BAD_REQUEST', 'museumId and content are required', 400);
        }

        // 3줄 및 각 120자 제한 검증 로직 (Server Enforcement)
        const lines = content.split(/\r\n|\r|\n/);
        if (lines.length > 3) {
            return errorResponse('VALIDATION_ERROR', 'Review content must not exceed 3 lines.', 400);
        }

        for (const line of lines) {
            if (line.length > 120) {
                return errorResponse('VALIDATION_ERROR', 'Each line must not exceed 120 characters.', 400);
            }
        }

        if (photos && Array.isArray(photos) && photos.length > 3) {
            return errorResponse('VALIDATION_ERROR', 'Maximum 3 photos allowed.', 400);
        }

        const review = await prisma.review.create({
            data: {
                userId: user.id,
                museumId,
                content,
                photos: photos || []
            }
        });

        return successResponse(review, 201);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        console.error('API Error /reviews:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to create review', 500);
    }
}
