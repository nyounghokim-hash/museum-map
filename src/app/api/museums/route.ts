import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');
        const country = searchParams.get('country');
        const bbox = searchParams.get('bbox'); // format: minLng,minLat,maxLng,maxLat
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 2000);
        const offset = (page - 1) * limit;

        let museums;
        let total = 0;

        const where: Prisma.MuseumWhereInput = {};

        if (bbox) {
            const parts = bbox.split(',').map(Number);
            if (parts.length !== 4 || parts.some(isNaN)) {
                return errorResponse('INVALID_BBOX', 'Invalid bounding box parameters. Expected minLng,minLat,maxLng,maxLat', 400);
            }
            const [minLng, minLat, maxLng, maxLat] = parts;
            // Use latitude/longitude columns for bbox filtering instead of PostGIS
            where.longitude = { gte: minLng, lte: maxLng };
            where.latitude = { gte: minLat, lte: maxLat };
        }

        if (query) {
            where.name = { contains: query, mode: 'insensitive' };
        }
        if (country) {
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
        museums = data;
        total = count;

        return successResponse({ data: museums, total, page, limit });
    } catch (err: any) {
        console.error('API Error /museums:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch museums', 500, err.message);
    }
}
