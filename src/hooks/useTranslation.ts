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
        if (!text) {
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

/**
 * Translate multiple texts at once. Returns a Map<original, translated>.
 * Only translates when locale is not 'ko'.
 */
export function useTranslatedTexts(texts: string[], locale: Locale): Map<string, string> {
    const [map, setMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        if (!texts.length || locale === 'ko') {
            setMap(new Map(texts.map(t => [t, t])));
            return;
        }

        let cancelled = false;
        const result = new Map<string, string>();
        const toFetch: string[] = [];

        // Check caches first
        for (const text of texts) {
            if (!text) { result.set(text, text); continue; }
            const key = getCacheKey(text, locale);
            if (memoryCache.has(key)) {
                result.set(text, memoryCache.get(key)!);
            } else {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        memoryCache.set(key, cached);
                        result.set(text, cached);
                        continue;
                    }
                } catch { }
                toFetch.push(text);
                result.set(text, text); // default to original while loading
            }
        }

        setMap(new Map(result));

        if (toFetch.length === 0) return;

        // Fetch translations in parallel
        Promise.all(
            toFetch.map(text =>
                fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, targetLang: locale }),
                })
                    .then(r => r.json())
                    .then(data => ({ text, translated: data.translated || text }))
                    .catch(() => ({ text, translated: text }))
            )
        ).then(results => {
            if (cancelled) return;
            const updated = new Map(result);
            for (const { text, translated } of results) {
                updated.set(text, translated);
                const key = getCacheKey(text, locale);
                memoryCache.set(key, translated);
                try { localStorage.setItem(key, translated); } catch { }
            }
            setMap(updated);
        });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(texts), locale]);

    return map;
}
