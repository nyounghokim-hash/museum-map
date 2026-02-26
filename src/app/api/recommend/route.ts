import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();
        if (!query || query.trim().length < 2) {
            return NextResponse.json({ error: 'Query too short' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
        }

        // Minimal prompt: ~150 tokens input
        const prompt = `Parse museum search intent. Reply JSON only: {"types":[],"countries":[],"text":""}
Types: Contemporary Art,Modern Art,Fine Arts,Art Gallery,General Museum,Cultural Center,Design Museum,Photography Museum,Science Museum,Natural History,History Museum,Archaeological Museum
Countries: ISO 2-letter codes.
Query: "${query.substring(0, 100)}"`;

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0, maxOutputTokens: 150 }
                }),
                signal: AbortSignal.timeout(10000),
            }
        );

        if (!res.ok) {
            if (res.status === 429) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
            return NextResponse.json({ error: 'AI unavailable' }, { status: 503 });
        }

        const raw = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
        let filters;
        try {
            filters = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}');
        } catch { filters = {}; }

        // Build query
        const where: any = { AND: [] };
        if (filters.types?.length) where.AND.push({ type: { in: filters.types } });
        if (filters.countries?.length) where.AND.push({ country: { in: filters.countries } });
        if (filters.text) {
            where.AND.push({
                OR: [
                    { name: { contains: filters.text, mode: 'insensitive' } },
                    { description: { contains: filters.text, mode: 'insensitive' } },
                ]
            });
        }

        const results = await prisma.museum.findMany({
            where: where.AND.length > 0 ? where : undefined,
            take: 10,
            select: { id: true, name: true, description: true, country: true, city: true, type: true, imageUrl: true, latitude: true, longitude: true }
        });

        return NextResponse.json({ data: results, filters });
    } catch (e: any) {
        console.error('Recommend error:', e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
