import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Museum name required' }, { status: 400 });
        }

        // Check cache in DB
        const museum = await prisma.museum.findUnique({
            where: { id },
            select: { lastExhibitionSync: true }
        });

        if (!museum) {
            return NextResponse.json({ error: 'Museum not found' }, { status: 404 });
        }

        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const isFresh = museum.lastExhibitionSync && (now.getTime() - museum.lastExhibitionSync.getTime() < SEVEN_DAYS);

        if (isFresh) {
            // Return cached exhibitions
            const cachedExhibitions = await prisma.exhibition.findMany({
                where: { museumId: id, source: 'SERPER' },
                orderBy: { createdAt: 'desc' }
            });
            // If we have cached ones, return them. If 0, it means we recently found 0, which is also valid cache.
            return NextResponse.json({ data: cachedExhibitions });
        }

        // --- Cache Expired or Never Synced: Fetch from Serper ---
        const apiKey = process.env.SERPER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing SERPER_API_KEY' }, { status: 500 });
        }

        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", apiKey);
        myHeaders.append("Content-Type", "application/json");

        const q = `current exhibitions at ${name} official`;
        const raw = JSON.stringify({ "q": q, "num": 5 });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow' as RequestRedirect
        };

        const response = await fetch("https://google.serper.dev/search", requestOptions);
        const result = await response.json();

        // Extract organic results that look like exhibition pages
        const exhibitions = result.organic?.map((item: any) => ({
            title: item.title.replace(`- ${name}`, '').replace(`| ${name}`, '').trim().substring(0, 100),
            description: item.snippet ? item.snippet.substring(0, 500) : null,
            link: item.link ? item.link.substring(0, 200) : null,
            imageUrl: item.imageUrl ? item.imageUrl.substring(0, 400) : null,
            source: 'SERPER',
            museumId: id
        })) || [];

        const topExhibitions = exhibitions.slice(0, 3);

        // Transaction to update DB: Delete old Serper ones, insert new ones, update timestamp
        await prisma.$transaction([
            prisma.exhibition.deleteMany({
                where: { museumId: id, source: 'SERPER' }
            }),
            prisma.exhibition.createMany({
                data: topExhibitions
            }),
            prisma.museum.update({
                where: { id },
                data: { lastExhibitionSync: now }
            })
        ]);

        // Return latest fetched
        const newCached = await prisma.exhibition.findMany({
            where: { museumId: id, source: 'SERPER' },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ data: newCached });

    } catch (error: any) {
        console.error('Serper/DB Sync Error:', error);
        return NextResponse.json({ error: 'Failed to fetch or cache exhibitions' }, { status: 500 });
    }
}
