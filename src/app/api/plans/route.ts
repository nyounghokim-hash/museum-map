import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        const { title, date, stops } = await req.json();

        if (!stops || !Array.isArray(stops)) {
            return errorResponse('BAD_REQUEST', 'stops array required', 400);
        }

        const plan = await prisma.plan.create({
            data: {
                userId: user.id,
                title: title || 'New Trip Plan',
                date: date ? new Date(date) : undefined,
                stops: {
                    create: stops.map((s: any) => ({
                        museumId: s.museumId,
                        order: s.order,
                        expectedArrival: s.expectedArrival ? new Date(s.expectedArrival) : null
                    }))
                }
            },
            include: { stops: true }
        });

        return successResponse(plan, 201);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to create plan', 500);
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        const plans = await prisma.plan.findMany({
            where: { userId: user.id },
            include: { stops: { include: { museum: { select: { name: true } } } } },
            orderBy: { date: 'asc' }
        });
        return successResponse(plans);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch plans', 500);
    }
}
