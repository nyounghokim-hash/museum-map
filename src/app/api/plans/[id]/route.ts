import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await requireAuth();
        const { id } = await params;
        const plan = await prisma.plan.findUnique({
            where: { id },
            include: {
                stops: {
                    include: { museum: true },
                    orderBy: { order: 'asc' }
                }
            }
        });
        if (!plan || plan.userId !== user.id) return errorResponse('NOT_FOUND', 'Plan not found', 404);
        return successResponse(plan);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to get plan', 500);
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await requireAuth();
        const { id } = await params;
        const body = await req.json();
        const plan = await prisma.plan.findUnique({ where: { id } });
        if (!plan || plan.userId !== user.id) return errorResponse('NOT_FOUND', 'Plan not found', 404);
        const updated = await prisma.plan.update({
            where: { id },
            data: {
                title: body.title !== undefined ? body.title : plan.title,
                date: body.date !== undefined ? new Date(body.date) : plan.date,
            }
        });
        return successResponse(updated);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to update plan', 500);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await requireAuth();
        const { id } = await params;
        const plan = await prisma.plan.findUnique({ where: { id } });
        if (!plan || plan.userId !== user.id) return errorResponse('NOT_FOUND', 'Plan not found', 404);
        // Delete stops first (foreign key), then plan
        await prisma.planStop.deleteMany({ where: { planId: id } });
        await prisma.plan.delete({ where: { id } });
        return successResponse({ deleted: true });
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete plan', 500);
    }
}
