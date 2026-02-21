import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await requireAuth();
        const { id } = await params;

        const collection = await prisma.collection.findUnique({ where: { id } });
        if (!collection || collection.userId !== user.id) {
            return errorResponse('NOT_FOUND', 'Collection not found', 404);
        }

        // Delete items first (foreign key), then collection
        await prisma.collectionItem.deleteMany({ where: { collectionId: id } });
        await prisma.collection.delete({ where: { id } });

        return successResponse({ deleted: true });
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete collection', 500);
    }
}
