'use client';
import { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';

// Client-side localStorage cache
const memoryCache = new Map<string, string>();

function getCacheKey(text: string, locale: Locale): string {
    return `tr:${locale}:${text.slice(0, 100)}`;
}

export function useTranslatedText(text: string | null | undefined, locale: Locale): string {
    const [translated, setTranslated] = useState(text || '');

    useEffect(() => {
        if (!text || locale === 'en') {
            setTranslated(text || '');
            return;
        }

        const key = getCacheKey(text, locale);

        // Check memory cache first
        if (memoryCache.has(key)) {
            setTranslated(memoryCache.get(key)!);
            return;
        }

        // Check localStorage
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                memoryCache.set(key, cached);
                setTranslated(cached);
                return;
            }
        } catch { }

        // Fetch translation
        let cancelled = false;
        fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLang: locale }),
        })
            .then(r => r.json())
            .then(data => {
                if (cancelled) return;
                const result = data.translated || text;
                memoryCache.set(key, result);
                try { localStorage.setItem(key, result); } catch { }
                setTranslated(result);
            })
            .catch(() => {
                if (!cancelled) setTranslated(text);
            });

        return () => { cancelled = true; };
    }, [text, locale]);

    return translated;
}
