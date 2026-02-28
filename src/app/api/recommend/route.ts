import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Keyword-to-filter mapping (no AI needed), ordered by specificity
const TYPE_KEYWORDS: Record<string, string[]> = {
    'Contemporary Art': ['현대미술', 'contemporary art', 'contemporary'],
    'Modern Art': ['모던아트', 'modern art', '근대미술'],
    'Fine Arts': ['fine art', 'painting', '회화', '미술관'],
    'Art Gallery': ['갤러리', 'gallery'],
    'Science Museum': ['과학', 'science', '아이', 'children', 'kids', 'family', '가족'],
    'Natural History': ['자연사', 'natural history', 'dinosaur', '공룡'],
    'History Museum': ['역사', 'history', 'war', '전쟁'],
    'Design Museum': ['디자인', 'design', 'fashion', '패션'],
    'Photography Museum': ['사진', 'photo', 'photography'],
    'Archaeological Museum': ['고고학', 'archaeological', 'ancient', '고대'],
    'General Museum': ['박물관', 'museum'],
    'Cultural Center': ['문화', 'cultural', 'culture'],
};

const REGION_KEYWORDS: Record<string, string[]> = {
    'europe': ['유럽', 'europe', 'european'],
    'asia': ['아시아', 'asia', 'asian'],
    'america': ['미국', 'america', 'usa', 'us'],
    'japan': ['일본', 'japan', 'japanese', 'tokyo'],
    'korea': ['한국', 'korea', 'korean', 'seoul'],
    'france': ['프랑스', 'france', 'paris'],
    'italy': ['이탈리아', 'italy', 'rome', 'roma'],
    'uk': ['영국', 'uk', 'london', 'england', 'british'],
    'germany': ['독일', 'germany', 'berlin'],
    'spain': ['스페인', 'spain', 'madrid', 'barcelona'],
};

const REGION_COUNTRIES: Record<string, string[]> = {
    'europe': ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PT', 'GR', 'PL', 'CZ', 'HU', 'RO', 'IE'],
    'asia': ['JP', 'KR', 'CN', 'TW', 'TH', 'SG', 'MY', 'ID', 'PH', 'VN', 'IN'],
    'america': ['US'],
    'japan': ['JP'],
    'korea': ['KR'],
    'france': ['FR'],
    'italy': ['IT'],
    'uk': ['GB'],
    'germany': ['DE'],
    'spain': ['ES'],
};

function localSearch(query: string) {
    const q = query.toLowerCase();
    const types: string[] = [];
    const countries: string[] = [];
    let textSearch = query;

    // Match types
    for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
        if (keywords.some(kw => q.includes(kw))) {
            types.push(type);
        }
    }

    // Match regions/countries
    for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
        if (keywords.some(kw => q.includes(kw))) {
            const codes = REGION_COUNTRIES[region];
            if (codes) countries.push(...codes);
        }
    }

    return { types: [...new Set(types)], countries: [...new Set(countries)], text: textSearch };
}

export async function POST(req: NextRequest) {
    try {
        const { query, locale } = await req.json();
        if (!query || query.trim().length < 2) {
            return NextResponse.json({ error: 'Query too short' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let filters: any = null;
        let usedAI = false;

        // Try Gemini first
        if (apiKey) {
            try {
                const prompt = `Parse museum search. Reply JSON only: {"types":[],"countries":[],"text":""}
Types: Contemporary Art,Modern Art,Fine Arts,Art Gallery,General Museum,Cultural Center,Design Museum,Photography Museum,Science Museum,Natural History,History Museum,Archaeological Museum
Countries: ISO 2-letter. Query: "${query.substring(0, 80)}"`;

                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0, maxOutputTokens: 100 }
                        }),
                        signal: AbortSignal.timeout(8000),
                    }
                );

                if (res.ok) {
                    const raw = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const match = raw.match(/\{[\s\S]*\}/);
                    if (match) {
                        filters = JSON.parse(match[0]);
                        usedAI = true;
                    }
                }
            } catch { /* fallback to local */ }
        }

        // Fallback: keyword matching
        if (!filters) {
            filters = localSearch(query);
        }

        // Build query
        const where: any = { AND: [] };
        if (filters.types?.length) where.AND.push({ type: { in: filters.types } });
        if (filters.countries?.length) where.AND.push({ country: { in: filters.countries } });
        if (filters.text && !filters.types?.length && !filters.countries?.length) {
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

        // Generate recommendation reasons via Gemini
        let reasons: Record<string, string> = {};
        if (apiKey && results.length > 0) {
            try {
                const lang = locale === 'ko' ? '한국어' : 'English';
                const museumList = results.slice(0, 10).map((r: any, i: number) => `${i + 1}. ${r.name} (${r.city}, ${r.country})`).join('\n');
                const reasonPrompt = `User searched: "${query.substring(0, 80)}"
Results:
${museumList}

For each museum, write ONE short reason (under 15 words) why it matches the search, in ${lang}. Reply JSON only: {"1":"reason","2":"reason",...}`;

                const reasonRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: reasonPrompt }] }],
                            generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
                        }),
                        signal: AbortSignal.timeout(6000),
                    }
                );
                if (reasonRes.ok) {
                    const reasonRaw = (await reasonRes.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const reasonMatch = reasonRaw.match(/\{[\s\S]*\}/);
                    if (reasonMatch) {
                        const parsed = JSON.parse(reasonMatch[0]);
                        results.forEach((r: any, i: number) => {
                            if (parsed[String(i + 1)]) reasons[r.id] = parsed[String(i + 1)];
                        });
                    }
                }
            } catch { /* reasons are optional */ }
        }

        // Fallback: generate template-based reasons if Gemini didn't produce them
        const generateFallbackReason = (r: any) => {
            const isKo = locale === 'ko';
            const countryName = (() => { try { return new Intl.DisplayNames([locale || 'en'], { type: 'region' }).of(r.country); } catch { return r.country; } })();
            const typeName = r.type || '';
            if (isKo) {
                return `${r.city ? r.city + ', ' : ''}${countryName}의 ${typeName} — "${query}" 검색 결과`;
            }
            return `${typeName} in ${r.city ? r.city + ', ' : ''}${countryName} — matches "${query}"`;
        };

        const dataWithReasons = results.map((r: any) => ({ ...r, reason: reasons[r.id] || generateFallbackReason(r) }));

        // Log AI usage to AuditLog for admin dashboard
        if (usedAI) {
            try {
                await prisma.auditLog.create({
                    data: {
                        adminId: 'system',
                        action: `recommend:gemini:${results.length}results`,
                        target: query.substring(0, 100),
                    }
                });
            } catch { /* AuditLog is optional */ }
        }

        return NextResponse.json({ data: dataWithReasons, filters, ai: usedAI });
    } catch (e: any) {
        console.error('Recommend error:', e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
