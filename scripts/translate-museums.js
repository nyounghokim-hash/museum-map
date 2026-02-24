/**
 * Museum Description Translation Script
 * 
 * Translates all museum descriptions using MyMemory API
 * and stores them in a JSON file per language for faster loading.
 * The app can load these pre-translated descriptions instead of
 * calling the API at runtime.
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2
});

const LANGUAGES = [
    { code: 'ko', name: 'Korean' },
    { code: 'ja', name: 'Japanese' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh-CN', name: 'Chinese Simplified' },
    { code: 'zh-TW', name: 'Chinese Traditional' },
    { code: 'sv', name: 'Swedish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'da', name: 'Danish' },
    { code: 'et', name: 'Estonian' },
];

async function translateText(text, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|${targetLang}`;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        const translated = data?.responseData?.translatedText;
        if (translated && translated !== text && !translated.includes('MYMEMORY WARNING')) {
            return translated;
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function main() {
    const outputDir = path.join(__dirname, '..', 'public', 'translations');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // Fetch all museums
    const { rows: museums } = await pool.query('SELECT id, name, description FROM "Museum" WHERE description IS NOT NULL AND description != \'\' ORDER BY id');
    console.log(`Total museums with descriptions: ${museums.length}`);

    // Process one language at a time
    for (const lang of LANGUAGES) {
        const outputFile = path.join(outputDir, `museums_${lang.code}.json`);

        // Load existing translations if any
        let existing = {};
        if (fs.existsSync(outputFile)) {
            try { existing = JSON.parse(fs.readFileSync(outputFile, 'utf8')); } catch { }
        }

        const alreadyDone = Object.keys(existing).length;
        console.log(`\n=== ${lang.name} (${lang.code}) === [existing: ${alreadyDone}]`);

        let translated = 0, skipped = 0, errors = 0;

        for (let i = 0; i < museums.length; i++) {
            const m = museums[i];

            // Skip if already translated
            if (existing[m.id]) { skipped++; continue; }

            if ((translated + skipped) % 50 === 0 && translated > 0) {
                console.log(`  Progress: ${translated + skipped}/${museums.length} (translated: ${translated}, errors: ${errors})`);
                // Save intermediate results
                fs.writeFileSync(outputFile, JSON.stringify(existing, null, 0));
            }

            const result = await translateText(m.description, lang.code);
            if (result) {
                existing[m.id] = result;
                translated++;
            } else {
                errors++;
            }

            // Rate limit: MyMemory allows ~10 req/sec for free
            await new Promise(r => setTimeout(r, 200));
        }

        // Save final results
        fs.writeFileSync(outputFile, JSON.stringify(existing, null, 0));
        console.log(`  Done: translated ${translated}, skipped ${skipped}, errors ${errors}`);
        console.log(`  Total in file: ${Object.keys(existing).length}`);
    }

    console.log('\n=== ALL DONE ===');
    pool.end();
}

main().catch(e => { console.error(e); pool.end(); });
