import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
}

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        const { title, description, isPublic, items } = await req.json();

        if (!title || !items || !Array.isArray(items)) {
            return errorResponse('BAD_REQUEST', 'title and items array are required', 400);
        }

        const shareSlug = isPublic ? generateSlug(title) : null;

        const collection = await prisma.collection.create({
            data: {
                userId: user.id,
                title,
                description,
                isPublic: !!isPublic,
                shareSlug,
                items: {
                    create: items.map((item: any, index: number) => ({
                        museumId: item.museumId,
                        reviewId: item.reviewId || null,
                        order: item.order !== undefined ? item.order : index
                    }))
                }
            },
            include: { items: true }
        });

        return successResponse(collection, 201);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to create collection', 500);
    }
}
