const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3
});

// Use Wikidata REST API instead of SPARQL (more reliable)
async function searchEntity(name) {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&type=item&limit=5&format=json`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'MuseumMap/1.0' },
        signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.search || [];
}

async function getEntityDetails(qid) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims|labels&languages=en|ko&format=json`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'MuseumMap/1.0' },
        signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const entity = data.entities?.[qid];
    if (!entity) return null;

    const claims = entity.claims || {};

    // P856 = official website
    const website = claims.P856?.[0]?.mainsnak?.datavalue?.value || null;
    // P18 = image
    const imageFile = claims.P18?.[0]?.mainsnak?.datavalue?.value || null;
    const imageUrl = imageFile
        ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFile)}?width=800`
        : null;
    // P625 = coordinates  
    const coords = claims.P625?.[0]?.mainsnak?.datavalue?.value;
    // P17 = country -> P297 = ISO code
    const countryQid = claims.P17?.[0]?.mainsnak?.datavalue?.value?.id;
    // P31 = instance of
    const instanceQid = claims.P31?.[0]?.mainsnak?.datavalue?.value?.id;

    return { website, imageUrl, coords, countryQid, instanceQid };
}

function categorizeByQid(qid) {
    const map = {
        'Q207694': 'Art Gallery',        // art museum
        'Q1970365': 'Contemporary Art',  // contemporary art gallery  
        'Q1267914': 'Modern Art',        // modern art museum
        'Q16735822': 'Fine Arts',        // fine arts museum
        'Q33506': 'General Museum',      // museum
        'Q1329623': 'Cultural Center',   // cultural center
        'Q17431399': 'General Museum',   // national museum
        'Q3152824': 'General Museum',    // municipal museum
        'Q4989906': 'General Museum',    // monument museum
        'Q838948': 'Art Gallery',        // art gallery
    };
    return map[qid] || null;
}

async function enrichMuseums() {
    const { rows: museums } = await pool.query(`
        SELECT id, name, latitude, longitude, website, "imageUrl", country, type 
        FROM "Museum" 
        WHERE (website IS NULL OR website = '' OR "imageUrl" IS NULL OR "imageUrl" = '')
        ORDER BY id
    `);

    console.log(`Museums needing enrichment: ${museums.length}`);

    let updated = 0, errors = 0, notFound = 0;

    for (let i = 0; i < museums.length; i++) {
        const m = museums[i];
        const needsWebsite = !m.website;
        const needsImage = !m.imageUrl;

        if (i % 20 === 0) {
            console.log(`Progress: ${i}/${museums.length} (updated: ${updated}, not found: ${notFound}, errors: ${errors})`);
        }

        try {
            // Search for this museum
            const results = await searchEntity(m.name);
            if (!results.length) { notFound++; continue; }

            // Check descriptions for museum-related keywords
            const museumResult = results.find(r => {
                const desc = (r.description || '').toLowerCase();
                return desc.includes('museum') || desc.includes('gallery') || desc.includes('art') || desc.includes('culture');
            }) || results[0];

            const details = await getEntityDetails(museumResult.id);
            if (!details) { notFound++; continue; }

            const updates = [];
            const values = [];
            let paramIdx = 1;

            if (needsWebsite && details.website) {
                updates.push(`website = $${paramIdx++}`);
                values.push(details.website);
            }
            if (needsImage && details.imageUrl) {
                updates.push(`"imageUrl" = $${paramIdx++}`);
                values.push(details.imageUrl);
            }
            if (details.instanceQid) {
                const newType = categorizeByQid(details.instanceQid);
                if (newType) {
                    updates.push(`type = $${paramIdx++}`);
                    values.push(newType);
                }
            }

            if (updates.length > 0) {
                updates.push(`"updatedAt" = NOW()`);
                values.push(m.id);
                await pool.query(
                    `UPDATE "Museum" SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
                    values
                );
                updated++;
            }

            // Rate limit: 300ms between requests
            await new Promise(r => setTimeout(r, 300));
        } catch (e) {
            errors++;
            if (errors < 10) console.error(`Error [${m.name}]:`, e.message);
        }
    }

    console.log(`\n=== ENRICHMENT DONE ===`);
    console.log(`Updated: ${updated}, Not found: ${notFound}, Errors: ${errors}`);

    // Final stats
    const stats = await pool.query(`
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as has_website,
            COUNT(CASE WHEN "imageUrl" IS NOT NULL AND "imageUrl" != '' THEN 1 END) as has_image
        FROM "Museum"
    `);
    console.log('Final stats:', stats.rows[0]);

    pool.end();
}

enrichMuseums().catch(e => { console.error(e); pool.end(); });
