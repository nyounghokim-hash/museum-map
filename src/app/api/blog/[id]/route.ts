import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { translateText } from '@/lib/translate';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const post = await (prisma as any).story.findUnique({
            where: { id },
            include: {
                museums: {
                    include: {
                        museum: { select: { id: true, name: true, city: true, country: true, imageUrl: true, latitude: true, longitude: true } }
                    }
                }
            }
        });

        if (!post) {
            return errorResponse('NOT_FOUND', 'Blog post not found', 404);
        }

        // Increment views
        await (prisma as any).story.update({
            where: { id },
            data: { views: { increment: 1 } }
        });

        return successResponse(post);
    } catch (err: any) {
        console.error('Fetch single blog error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch blog post', 500);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await requireAuth();
        const body = await req.json();
        const { museumIds, ...updateData } = body;

        if (updateData.title) {
            updateData.titleEn = await translateText(updateData.title, 'en');
        }
        if (updateData.content) {
            updateData.contentEn = await translateText(updateData.content, 'en');
        }

        // Update museum connections if provided
        if (museumIds !== undefined) {
            // Delete existing connections and recreate
            await (prisma as any).storyMuseum.deleteMany({ where: { storyId: id } });
            if (museumIds.length > 0) {
                await (prisma as any).storyMuseum.createMany({
                    data: museumIds.map((mid: string) => ({ storyId: id, museumId: mid }))
                });
            }
        }

        const post = await (prisma as any).story.update({
            where: { id },
            data: updateData,
            include: {
                museums: {
                    include: { museum: { select: { id: true, name: true, city: true, country: true } } }
                }
            }
        });

        return successResponse(post);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        console.error('Update blog error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to update blog post', 500);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await requireAuth();

        // Soft delete by setting status to DELETED
        const post = await (prisma as any).story.update({
            where: { id },
            data: { status: 'DELETED' }
        });

        return successResponse({ message: 'Post marked as deleted', post });
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        console.error('Delete blog error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete blog post', 500);
    }
}
