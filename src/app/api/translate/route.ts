import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory cache to avoid repeated API calls within same server instance
const cache = new Map<string, string>();

const LANG_MAP: Record<string, string> = {
    ko: 'ko', ja: 'ja', de: 'de', fr: 'fr', es: 'es', pt: 'pt',
    'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW',
    sv: 'sv', fi: 'fi', da: 'da', et: 'et',
    en: 'en',
};

// Detect if text contains Korean characters
function containsKorean(text: string): boolean {
    return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
}

export async function POST(req: NextRequest) {
    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ translated: text });
        }

        const lang = LANG_MAP[targetLang];
        if (!lang) return NextResponse.json({ translated: text });

        // Auto-detect source language
        const isKorean = containsKorean(text);
        const sourceLang = isKorean ? 'ko' : 'en';

        // Skip if target = source
        if (lang === sourceLang) {
            return NextResponse.json({ translated: text });
        }

        const cacheKey = `${sourceLang}:${lang}:${text.slice(0, 200)}`;
        if (cache.has(cacheKey)) {
            return NextResponse.json({ translated: cache.get(cacheKey) });
        }

        // Use MyMemory free translation API (auto-detect source)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${sourceLang}|${lang}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();

        const translated = data?.responseData?.translatedText;
        if (translated && translated !== text) {
            cache.set(cacheKey, translated);
            // Log translation for admin dashboard
            try { await prisma.auditLog.create({ data: { adminId: 'system', action: `translate:${sourceLang}>${lang}`, target: text.substring(0, 80) } }); } catch { }
            return NextResponse.json({ translated });
        }

        return NextResponse.json({ translated: text });
    } catch {
        return NextResponse.json({ translated: '' });
    }
}
