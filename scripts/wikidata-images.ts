/**
 * Wikidata Image Enrichment Script
 * Fetches Wikimedia Commons images (P18) for art/contemporary museums
 * and updates Museum.imageUrl in the database.
 *
 * Usage: NODE_OPTIONS="--dns-result-order=ipv4first" npx tsx scripts/wikidata-images.ts
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

const SPARQL_QUERY = `
SELECT DISTINCT ?museum ?museumLabel ?image WHERE {
  VALUES ?museumType {
    wd:Q207694
    wd:Q2772772
    wd:Q1007870
    wd:Q16735822
  }
  ?museum wdt:P31 ?museumType .
  ?museum wdt:P18 ?image .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko,ja,fr,de,es,pt,zh" . }
}
LIMIT 3000
`;

interface WikiImageResult {
    museum: { value: string };
    museumLabel: { value: string };
    image: { value: string };
}

/**
 * Convert Wikimedia Commons file URL to a direct thumbnail URL (640px wide)
 */
function commonsToThumb(url: string, width = 640): string {
    // url looks like: http://commons.wikimedia.org/wiki/Special:FilePath/filename.jpg
    const filename = decodeURIComponent(url.split('/').pop() || '');
    if (!filename) return url;

    // MD5 hash for Commons directory structure
    const crypto = require('crypto');
    const md5 = crypto.createHash('md5').update(filename.replace(/ /g, '_')).digest('hex');
    const a = md5[0];
    const ab = md5.substring(0, 2);
    const encodedName = encodeURIComponent(filename.replace(/ /g, '_'));

    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${ab}/${encodedName}/${width}px-${encodedName}`;
}

async function main() {
    console.log('Fetching museum images from Wikidata...');

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL_QUERY)}&format=json`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'MuseumMapBot/1.0 (contact@museummap.app)', 'Accept': 'application/json' }
    });

    if (!res.ok) {
        console.error(`Wikidata error: ${res.status} ${res.statusText}`);
        process.exit(1);
    }

    const json = await res.json();
    const results: WikiImageResult[] = json.results.bindings;
    console.log(`Received ${results.length} museums with images`);

    // Build name → image map (deduplicate by name, keep first)
    const imageMap = new Map<string, { thumb: string; attribution: string }>();
    for (const r of results) {
        const name = r.museumLabel.value;
        if (imageMap.has(name)) continue;

        const thumb = commonsToThumb(r.image.value, 800);
        const attribution = `Wikimedia Commons (${r.image.value})`;
        imageMap.set(name, { thumb, attribution });
    }

    console.log(`${imageMap.size} unique museums with images`);

    // Update DB
    let updated = 0;
    let skipped = 0;
    let notFound = 0;

    for (const [name, { thumb }] of imageMap) {
        try {
            const result = await pool.query(
                `UPDATE "Museum" SET "imageUrl" = $1, "updatedAt" = NOW()
                 WHERE "name" = $2 AND ("imageUrl" IS NULL OR "imageUrl" = '')`,
                [thumb, name]
            );
            if (result.rowCount && result.rowCount > 0) {
                updated++;
            } else {
                // Check if museum exists
                const exists = await pool.query(`SELECT 1 FROM "Museum" WHERE "name" = $1`, [name]);
                if (exists.rowCount && exists.rowCount > 0) skipped++;
                else notFound++;
            }
        } catch (err) {
            // Ignore individual errors
        }
    }

    console.log(`\nImage enrichment complete:`);
    console.log(`  ✅ Updated:   ${updated}`);
    console.log(`  ⏭️  Skipped:   ${skipped} (already have image)`);
    console.log(`  ❌ Not found: ${notFound} (museum name mismatch)`);

    await pool.end();
}

main().catch(console.error);
