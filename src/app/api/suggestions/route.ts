import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
// requireAuth is not used so users can anonymously suggest updates
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // attempt optional fast login
        const user = await getSessionUser().catch(() => null);
        const { museumId, data } = await req.json();

        if (!data) return errorResponse('BAD_REQUEST', 'data payload required', 400);

        const suggestion = await prisma.suggestion.create({
            data: {
                userId: user?.id || null, // Allows anonymous
                museumId: museumId || null, // Null indicates a suggestion for a totally new unseen museum
                data: data
            }
        });

        return successResponse(suggestion, 201);
    } catch (err: any) {
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to submit suggestion', 500);
    }
}
