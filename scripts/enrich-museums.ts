/**
 * Museum Website Enrichment Script
 * Crawls museum websites to extract:
 *   1) og:image → imageUrl (thumbnail)
 *   2) Opening hours from structured data (JSON-LD / schema.org)
 *
 * Usage: NODE_OPTIONS="--dns-result-order=ipv4first" npx tsx scripts/enrich-museums.ts
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

const TIMEOUT = 8000; // 8 seconds per request
const DELAY = 300;     // Rate limit: 300ms between requests

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a page and extract og:image and opening hours
 */
async function crawlMuseumSite(url: string): Promise<{ ogImage?: string; hours?: Record<string, string> }> {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT);

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
        });
        clearTimeout(timer);

        if (!res.ok) return {};

        const html = await res.text();
        const result: { ogImage?: string; hours?: Record<string, string> } = {};

        // 1) Extract og:image
        const ogMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
            || html.match(/content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
        if (ogMatch?.[1]) {
            let imgUrl = ogMatch[1];
            // Make relative URLs absolute
            if (imgUrl.startsWith('/')) {
                const base = new URL(url);
                imgUrl = `${base.origin}${imgUrl}`;
            }
            result.ogImage = imgUrl;
        }

        // 2) Extract opening hours from JSON-LD (schema.org)
        const jsonLdMatches = html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
        for (const match of jsonLdMatches) {
            try {
                const data = JSON.parse(match[1]);
                const items = Array.isArray(data) ? data : [data];
                for (const item of items) {
                    if (item.openingHoursSpecification || item.openingHours) {
                        result.hours = parseOpeningHours(item);
                        break;
                    }
                    // Check @graph
                    if (item['@graph']) {
                        for (const node of item['@graph']) {
                            if (node.openingHoursSpecification || node.openingHours) {
                                result.hours = parseOpeningHours(node);
                                break;
                            }
                        }
                    }
                }
            } catch { /* ignore invalid JSON-LD */ }
        }

        // 3) Fallback: look for plain-text hour patterns in meta tags
        if (!result.hours) {
            const hoursMetaMatch = html.match(/<meta\s+(?:name|property)=["'](?:business:hours|opening_hours)["']\s+content=["']([^"']+)["']/i);
            if (hoursMetaMatch?.[1]) {
                result.hours = { info: hoursMetaMatch[1] };
            }
        }

        return result;
    } catch {
        return {};
    }
}

const DAY_MAP: Record<string, string> = {
    'Monday': 'mon', 'Tuesday': 'tue', 'Wednesday': 'wed',
    'Thursday': 'thu', 'Friday': 'fri', 'Saturday': 'sat', 'Sunday': 'sun',
    'Mo': 'mon', 'Tu': 'tue', 'We': 'wed', 'Th': 'thu', 'Fr': 'fri', 'Sa': 'sat', 'Su': 'sun',
    'https://schema.org/Monday': 'mon', 'https://schema.org/Tuesday': 'tue',
    'https://schema.org/Wednesday': 'wed', 'https://schema.org/Thursday': 'thu',
    'https://schema.org/Friday': 'fri', 'https://schema.org/Saturday': 'sat',
    'https://schema.org/Sunday': 'sun',
};

function parseOpeningHours(item: any): Record<string, string> | undefined {
    // schema.org openingHoursSpecification
    if (item.openingHoursSpecification) {
        const specs = Array.isArray(item.openingHoursSpecification)
            ? item.openingHoursSpecification : [item.openingHoursSpecification];
        const hours: Record<string, string> = {};
        for (const spec of specs) {
            const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
            const open = spec.opens || '';
            const close = spec.closes || '';
            const timeStr = `${open}–${close}`;
            for (const day of days) {
                const key = DAY_MAP[day] || DAY_MAP[String(day).split('/').pop() || ''] || day;
                if (key) hours[key] = timeStr;
            }
        }
        if (Object.keys(hours).length > 0) return hours;
    }
    // schema.org openingHours (string array like "Mo-Fr 10:00-18:00")
    if (item.openingHours) {
        const vals = Array.isArray(item.openingHours) ? item.openingHours : [item.openingHours];
        const hours: Record<string, string> = {};
        for (const val of vals) {
            hours.info = (hours.info ? hours.info + ', ' : '') + val;
        }
        if (Object.keys(hours).length > 0) return hours;
    }
    return undefined;
}

async function main() {
    console.log('🔍 Enriching museums from website crawling...\n');

    // Get all museums with a website URL
    const { rows: museums } = await pool.query(
        `SELECT id, name, website, "imageUrl", "openingHours" FROM "Museum" WHERE website IS NOT NULL AND website != '' ORDER BY name`
    );

    console.log(`Found ${museums.length} museums with websites\n`);

    let imgUpdated = 0, hoursUpdated = 0, failed = 0, skipped = 0;

    for (let i = 0; i < museums.length; i++) {
        const m = museums[i];
        const hasImage = m.imageUrl && m.imageUrl !== '';
        const hasHours = m.openingHours && Object.keys(m.openingHours).length > 0;

        if (hasImage && hasHours) {
            skipped++;
            continue;
        }

        process.stdout.write(`[${i + 1}/${museums.length}] ${m.name}... `);

        const result = await crawlMuseumSite(m.website);

        const updates: string[] = [];
        const values: any[] = [];
        let paramIdx = 1;

        if (!hasImage && result.ogImage) {
            updates.push(`"imageUrl" = $${paramIdx++}`);
            values.push(result.ogImage);
            imgUpdated++;
        }

        if (!hasHours && result.hours) {
            updates.push(`"openingHours" = $${paramIdx++}`);
            values.push(JSON.stringify(result.hours));
            hoursUpdated++;
        }

        if (updates.length > 0) {
            updates.push(`"updatedAt" = NOW()`);
            values.push(m.id);
            await pool.query(
                `UPDATE "Museum" SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
                values
            );
            console.log(`✅ ${updates.length - 1} field(s)`);
        } else {
            console.log(`⏭️  no data found`);
            failed++;
        }

        await sleep(DELAY);
    }

    console.log(`\n═══════════════════════════════════`);
    console.log(`  ✅ Images updated: ${imgUpdated}`);
    console.log(`  ⏰ Hours updated:  ${hoursUpdated}`);
    console.log(`  ⏭️  Skipped:        ${skipped}`);
    console.log(`  ❌ No data:        ${failed}`);
    console.log(`═══════════════════════════════════`);

    await pool.end();
}

main().catch(console.error);
