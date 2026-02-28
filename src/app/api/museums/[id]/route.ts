import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return errorResponse('INVALID_ID', 'Museum ID is required', 400);
        }
        const museum = await prisma.museum.findUnique({
            where: { id },
            include: {
                exhibitions: true,
                reviews: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { id: true, name: true, image: true } } }
                },
                stories: {
                    include: { story: { select: { artworks: true } } }
                }
            }
        });
        if (!museum) {
            return errorResponse('NOT_FOUND', 'Museum not found', 404);
        }
        // Extract artworks from linked stories
        const artworks = (museum as any).stories
            ?.flatMap((sm: any) => sm.story?.artworks || []) || [];
        // strip geometry column mapping if any
        const { location, stories: _stories, ...safeMuseumData } = museum as any;
        return successResponse({ ...safeMuseumData, artworks });
    } catch (err: any) {
        console.error('API Error /museums/[id]:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch museum details', 500, err.message);
    }
}
