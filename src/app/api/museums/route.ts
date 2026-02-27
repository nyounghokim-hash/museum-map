import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');
        const country = searchParams.get('country');
        const bbox = searchParams.get('bbox'); // format: minLng,minLat,maxLng,maxLat
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 5000);
        const offset = (page - 1) * limit;

        const where: any = {};

        if (bbox) {
            const parts = bbox.split(',').map(Number);
            if (parts.length !== 4 || parts.some(isNaN)) {
                return errorResponse('INVALID_BBOX', 'Invalid bounding box parameters. Expected minLng,minLat,maxLng,maxLat', 400);
            }
            const [minLng, minLat, maxLng, maxLat] = parts;
            where.longitude = { gte: minLng, lte: maxLng };
            where.latitude = { gte: minLat, lte: maxLat };
        }

        const q = searchParams.get('q') || query;
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { city: { contains: q, mode: 'insensitive' } },
                { country: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (country && !q) {
            where.country = country;
        }

        const [data, count] = await Promise.all([
            prisma.museum.findMany({
                where,
                orderBy: { popularityScore: 'desc' },
                skip: offset,
                take: limit,
                select: {
                    id: true, name: true, description: true, country: true, city: true,
                    type: true, website: true, imageUrl: true, latitude: true, longitude: true, popularityScore: true
                }
            }),
            prisma.museum.count({ where })
        ]);

        return successResponse({ data, total: count, page, limit });
    } catch (err: any) {
        console.error('API Error /museums:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch museums', 500, err.message);
    }
}
