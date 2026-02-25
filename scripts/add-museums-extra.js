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
        signal: AbortSignal.timeout(90000)
    });
    if (!res.ok) throw new Error(`SPARQL error: ${res.status}`);
    return res.json();
}

async function fetchMuseumsByType(typeQid, typeName, limit = 600, offset = 0) {
    const query = `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?lat ?lon ?website ?image ?countryCode ?cityLabel WHERE {
        ?item wdt:P31/wdt:P279* wd:${typeQid}.
        ?item wdt:P625 ?coord.
        BIND(geof:latitude(?coord) AS ?lat)
        BIND(geof:longitude(?coord) AS ?lon)
        OPTIONAL { ?item wdt:P856 ?website. }
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL { ?item wdt:P17 ?countryEntity. ?countryEntity wdt:P297 ?countryCode. }
        OPTIONAL { ?item wdt:P131 ?city. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko". }
    }
    ORDER BY ?itemLabel
    LIMIT ${limit}
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
            country: (r.countryCode?.value || '').toUpperCase(),
            city: r.cityLabel?.value || '',
            type: typeName,
            wikidataId: r.item?.value?.split('/').pop() || ''
        }));
    } catch (e) {
        console.error(`Error fetching ${typeName}:`, e.message);
        return [];
    }
}

async function main() {
    const { rows: existing } = await pool.query('SELECT name, latitude, longitude FROM "Museum"');
    const existingSet = new Set(existing.map(m => m.name.toLowerCase().trim()));
    console.log(`기존 박물관: ${existing.length}개`);

    // New categories not covered by the original script
    const types = [
        { qid: 'Q3329412', name: 'National Museum', limit: 500 },          // national museum
        { qid: 'Q2772772', name: 'Science Museum', limit: 400 },            // science museum
        { qid: 'Q17431399', name: 'History Museum', limit: 400 },           // history museum
        { qid: 'Q210272', name: 'Botanical Garden', limit: 300 },           // botanical garden (some overlap with cultural venues)
        { qid: 'Q2087181', name: 'Folk Museum', limit: 300 },               // folk museum
        { qid: 'Q856584', name: 'Maritime Museum', limit: 300 },            // maritime museum
        { qid: 'Q928830', name: 'Natural History Museum', limit: 400 },     // natural history museum
        { qid: 'Q1244442', name: 'Archaeological Museum', limit: 400 },     // archaeological museum
        { qid: 'Q1210272', name: 'Open Air Museum', limit: 300 },           // open-air museum  
        { qid: 'Q738570', name: 'Design Museum', limit: 300 },              // design museum
        { qid: 'Q15206070', name: 'Photography Museum', limit: 300 },       // photography museum
        { qid: 'Q2772759', name: 'Military Museum', limit: 300 },           // military museum
        { qid: 'Q3658341', name: 'Music Museum', limit: 200 },              // music museum
        { qid: 'Q4287745', name: 'Sculpture Museum', limit: 200 },          // sculpture museum
        { qid: 'Q23413', name: 'Castle Museum', limit: 400 },               // castle (many serve as museums)
    ];

    let allNew = [];
    let totalFetched = 0;

    for (const t of types) {
        if (allNew.length >= 700) break; // Get more than needed to have buffer

        console.log(`\n🔍 ${t.name} (${t.qid})...`);
        const museums = await fetchMuseumsByType(t.qid, t.name, t.limit);
        totalFetched += museums.length;
        console.log(`  Wikidata에서 가져옴: ${museums.length}`);

        const filtered = museums.filter(m => {
            if (!m.name || m.name.startsWith('Q') || !m.latitude || !m.longitude) return false;
            if (!m.country || m.country.length !== 2) return false;
            if (existingSet.has(m.name.toLowerCase().trim())) return false;

            const tooClose = existing.some(e =>
                Math.abs(e.latitude - m.latitude) < 0.001 &&
                Math.abs(e.longitude - m.longitude) < 0.001
            );
            if (tooClose) return false;

            return true;
        });

        console.log(`  중복 제거 후: ${filtered.length}`);
        allNew.push(...filtered);
        filtered.forEach(m => {
            existingSet.add(m.name.toLowerCase().trim());
            existing.push({ name: m.name, latitude: m.latitude, longitude: m.longitude });
        });

        await new Promise(r => setTimeout(r, 3000));
    }

    console.log(`\n=== Wikidata 총 가져옴: ${totalFetched} ===`);
    console.log(`=== 중복 제거 후 신규: ${allNew.length} ===`);

    // Limit to 600
    const toInsert = allNew.slice(0, 600);
    console.log(`\n삽입 예정: ${toInsert.length}개`);

    let inserted = 0;
    let errors = 0;
    for (const m of toInsert) {
        try {
            await pool.query(`
                INSERT INTO "Museum" (id, name, description, country, city, type, website, "imageUrl", latitude, longitude, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            `, [m.name, m.description || `${m.name} - ${m.type}`, m.country, m.city, m.type, m.website, m.imageUrl, m.latitude, m.longitude]);
            inserted++;
            if (inserted % 50 === 0) console.log(`  진행: ${inserted}/${toInsert.length}`);
        } catch (e) {
            errors++;
        }
    }

    console.log(`\n✅ 삽입 완료: ${inserted}개 (오류: ${errors}개)`);

    const { rows: [total] } = await pool.query('SELECT COUNT(*) as cnt FROM "Museum"');
    console.log(`📊 총 박물관 수: ${total.cnt}개`);

    pool.end();
}

main().catch(e => { console.error(e); pool.end(); });
