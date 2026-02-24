const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3
});

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';

async function sparqlQuery(query) {
    const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}&format=json`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'MuseumMap/1.0 (museum-map-enrichment)' },
        signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) throw new Error(`SPARQL error: ${res.status}`);
    return res.json();
}

// Fetch museums from Wikidata by type
async function fetchMuseumsByType(typeQid, typeName, offset = 0) {
    const query = `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?lat ?lon ?website ?image ?countryCode ?country ?cityLabel WHERE {
        ?item wdt:P31/wdt:P279* wd:${typeQid}.
        ?item wdt:P625 ?coord.
        BIND(geof:latitude(?coord) AS ?lat)
        BIND(geof:longitude(?coord) AS ?lon)
        OPTIONAL { ?item wdt:P856 ?website. }
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL { ?item wdt:P17 ?countryEntity. ?countryEntity wdt:P297 ?countryCode. }
        OPTIONAL { ?item wdt:P17 ?countryEntity. }
        OPTIONAL { ?item wdt:P131 ?city. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko". }
    }
    ORDER BY ?itemLabel
    LIMIT 500
    OFFSET ${offset}`;

    try {
        const data = await sparqlQuery(query);
        return (data.results?.bindings || []).map(r => ({
            name: r.itemLabel?.value || '',
            description: r.itemDescription?.value || '',
            latitude: parseFloat(r.lat?.value) || 0,
            longitude: parseFloat(r.lon?.value) || 0,
            website: r.website?.value || null,
            imageUrl: r.image?.value ? r.image.value.replace('http://', 'https://') : null,
            country: r.countryCode?.value || '',
            city: r.cityLabel?.value || '',
            type: typeName,
            wikidataId: r.item?.value?.split('/').pop() || ''
        }));
    } catch (e) {
        console.error(`Error fetching ${typeName}:`, e.message);
        return [];
    }
}

async function addNewMuseums() {
    // Get existing museum names for dedup
    const { rows: existing } = await pool.query('SELECT name, latitude, longitude FROM "Museum"');
    const existingSet = new Set(existing.map(m => m.name.toLowerCase().trim()));

    console.log(`Existing museums: ${existing.length}`);

    // Museum types to fetch from Wikidata
    const types = [
        { qid: 'Q207694', name: 'Art Gallery' },          // art museum
        { qid: 'Q1970365', name: 'Contemporary Art' },    // contemporary art gallery
        { qid: 'Q1267914', name: 'Modern Art' },           // modern art museum
        { qid: 'Q16735822', name: 'Fine Arts' },           // fine arts museum
        { qid: 'Q33506', name: 'General Museum' },         // museum (general)
        { qid: 'Q1329623', name: 'Cultural Center' },      // cultural center
        { qid: 'Q18674739', name: 'Art Gallery' },          // private art gallery
        { qid: 'Q4989906', name: 'General Museum' },       // monument museum
    ];

    let allNew = [];

    for (const t of types) {
        console.log(`\nFetching ${t.name} (${t.qid})...`);
        const museums = await fetchMuseumsByType(t.qid, t.name);
        console.log(`  Found: ${museums.length}`);

        // Filter out duplicates and entries without coordinates
        const filtered = museums.filter(m => {
            if (!m.name || m.name.startsWith('Q') || !m.latitude || !m.longitude) return false;
            if (existingSet.has(m.name.toLowerCase().trim())) return false;

            // Check coordinate proximity to existing museums (within ~100m)
            const tooClose = existing.some(e =>
                Math.abs(e.latitude - m.latitude) < 0.001 &&
                Math.abs(e.longitude - m.longitude) < 0.001
            );
            if (tooClose) return false;

            return true;
        });

        console.log(`  New unique: ${filtered.length}`);
        allNew.push(...filtered);

        // Add to existingSet to deduplicate across types
        filtered.forEach(m => existingSet.add(m.name.toLowerCase().trim()));

        // Wait between requests
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\nTotal new museums to add: ${allNew.length}`);

    // Insert into DB
    let inserted = 0;
    for (const m of allNew) {
        try {
            await pool.query(`
                INSERT INTO "Museum" (id, name, description, country, city, type, website, "imageUrl", latitude, longitude, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            `, [m.name, m.description || `${m.name} - ${m.type}`, m.country, m.city, m.type, m.website, m.imageUrl, m.latitude, m.longitude]);
            inserted++;
        } catch (e) {
            // Likely duplicate, skip
        }
    }

    console.log(`\nInserted: ${inserted}`);

    const { rows: [total] } = await pool.query('SELECT COUNT(*) as cnt FROM "Museum"');
    console.log(`Total museums now: ${total.cnt}`);

    pool.end();
}

addNewMuseums().catch(e => { console.error(e); pool.end(); });
