import { NextRequest, NextResponse } from 'next/server';

// In-memory cache to avoid repeated API calls within same server instance
const cache = new Map<string, string>();

const LANG_MAP: Record<string, string> = {
    ko: 'ko', ja: 'ja', de: 'de', fr: 'fr', es: 'es', pt: 'pt',
    'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW',
    sv: 'sv', fi: 'fi', da: 'da', et: 'et',
};

export async function POST(req: NextRequest) {
    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang || targetLang === 'en') {
            return NextResponse.json({ translated: text });
        }

        const lang = LANG_MAP[targetLang];
        if (!lang) return NextResponse.json({ translated: text });

        const cacheKey = `${lang}:${text.slice(0, 200)}`;
        if (cache.has(cacheKey)) {
            return NextResponse.json({ translated: cache.get(cacheKey) });
        }

        // Use MyMemory free translation API (no key required)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|${lang}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();

        const translated = data?.responseData?.translatedText;
        if (translated && translated !== text) {
            cache.set(cacheKey, translated);
            return NextResponse.json({ translated });
        }

        return NextResponse.json({ translated: text });
    } catch {
        return NextResponse.json({ translated: '' });
    }
}
