import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
    try {
        await requireAuth();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const offset = (page - 1) * limit;

        const where: any = {};
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { city: { contains: query, mode: 'insensitive' } },
                { country: { contains: query, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.museum.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: { updatedAt: 'desc' },
            }),
            prisma.museum.count({ where }),
        ]);

        return successResponse({ data, total, page, limit });
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Admin access required', 401);
        console.error('Admin Museum GET Error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch museums', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAuth();
        const body = await req.json();
        const { name, description, country, city, type, latitude, longitude, imageUrl, website } = body;

        if (!name || !country || !city || !type || latitude === undefined || longitude === undefined) {
            return errorResponse('BAD_REQUEST', 'Missing required fields', 400);
        }

        const museum = await prisma.museum.create({
            data: {
                name,
                description,
                country,
                city,
                type,
                latitude,
                longitude,
                imageUrl,
                website,
                popularityScore: 0,
            },
        });

        return successResponse(museum, 201);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Admin access required', 401);
        console.error('Admin Museum POST Error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to create museum', 500);
    }
}

export async function PUT(req: NextRequest) {
    try {
        await requireAuth();
        const body = await req.json();
        const { id } = body;

        if (!id) return errorResponse('BAD_REQUEST', 'Museum ID is required', 400);

        // Explicitly pick only allowed Museum fields to avoid Prisma errors
        const updateData: any = {};
        const allowedFields = ['name', 'description', 'country', 'city', 'type', 'latitude', 'longitude', 'imageUrl', 'website', 'popularityScore', 'visitorInfo'];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const updated = await prisma.museum.update({
            where: { id },
            data: updateData,
        });

        return successResponse(updated);
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Admin access required', 401);
        console.error('Admin Museum PUT Error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to update museum', 500);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await requireAuth();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return errorResponse('BAD_REQUEST', 'Museum ID is required', 400);

        await prisma.museum.delete({ where: { id } });
        return successResponse({ success: true });
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Admin access required', 401);
        console.error('Admin Museum DELETE Error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete museum', 500);
    }
}
