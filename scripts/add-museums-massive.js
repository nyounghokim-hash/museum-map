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
        signal: AbortSignal.timeout(120000)
    });
    if (!res.ok) throw new Error(`SPARQL error: ${res.status}`);
    return res.json();
}

async function fetchMuseumsByType(typeQid, typeName, limit = 500, offset = 0) {
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
        console.error(`  ⚠️ Error: ${e.message}`);
        return [];
    }
}

async function main() {
    const { rows: existing } = await pool.query('SELECT name, latitude, longitude FROM "Museum"');
    const existingSet = new Set(existing.map(m => m.name.toLowerCase().trim()));
    console.log(`기존 박물관: ${existing.length}개\n`);

    // Comprehensive list of museum/gallery types with pagination
    const types = [
        // Round 1: Core museum types with offset (pages not yet fetched)
        { qid: 'Q207694', name: 'Art Museum', pages: [[500, 0], [500, 500], [500, 1000]] },
        { qid: 'Q33506', name: 'General Museum', pages: [[500, 500], [500, 1000], [500, 1500], [500, 2000]] },
        { qid: 'Q1970365', name: 'Contemporary Art', pages: [[500, 500], [500, 1000]] },
        { qid: 'Q1267914', name: 'Modern Art Museum', pages: [[500, 500]] },

        // Round 2: More specific types
        { qid: 'Q1244442', name: 'Archaeological Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q2772772', name: 'Science Museum', pages: [[500, 400]] },
        { qid: 'Q17431399', name: 'History Museum', pages: [[500, 400], [500, 900]] },
        { qid: 'Q856584', name: 'Maritime Museum', pages: [[500, 300]] },
        { qid: 'Q738570', name: 'Design Museum', pages: [[500, 300]] },

        // Round 3: New types not yet tried
        { qid: 'Q2772759', name: 'Military Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q15206070', name: 'Photography Museum', pages: [[500, 0]] },
        { qid: 'Q3658341', name: 'Music Museum', pages: [[500, 0]] },
        { qid: 'Q4287745', name: 'Sculpture Museum', pages: [[500, 0]] },
        { qid: 'Q1060829', name: 'Ethnographic Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q2087181', name: 'Folk Museum', pages: [[500, 300]] },
        { qid: 'Q2977', name: 'Cathedral/Church Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q57621', name: 'Heritage Site', pages: [[500, 0], [500, 500], [500, 1000]] },
        { qid: 'Q16560', name: 'Palace Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q3947', name: 'House Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q1030034', name: 'Technology Museum', pages: [[500, 0]] },
        { qid: 'Q588140', name: 'Planetarium', pages: [[500, 0]] },
        { qid: 'Q174782', name: 'Town Square/Heritage', pages: [[500, 0]] },
        { qid: 'Q7075', name: 'Library Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q57659', name: 'Monument Museum', pages: [[500, 0], [500, 500]] },
        { qid: 'Q2772819', name: 'Textile Museum', pages: [[500, 0]] },
        { qid: 'Q210272', name: 'Botanical Garden', pages: [[500, 0], [500, 500]] },
        { qid: 'Q176483', name: 'Aquarium', pages: [[500, 0]] },
        { qid: 'Q43501', name: 'Zoo', pages: [[500, 0], [500, 500]] },
    ];

    let allNew = [];
    let totalFetched = 0;

    for (const t of types) {
        for (const [limit, offset] of t.pages) {
            console.log(`🔍 ${t.name} (${t.qid}) offset=${offset}...`);
            const museums = await fetchMuseumsByType(t.qid, t.name, limit, offset);
            totalFetched += museums.length;

            const filtered = museums.filter(m => {
                if (!m.name || m.name.startsWith('Q') || !m.latitude || !m.longitude) return false;
                if (!m.country || m.country.length !== 2) return false;
                if (existingSet.has(m.name.toLowerCase().trim())) return false;
                const tooClose = existing.some(e =>
                    Math.abs(e.latitude - m.latitude) < 0.0008 &&
                    Math.abs(e.longitude - m.longitude) < 0.0008
                );
                if (tooClose) return false;
                return true;
            });

            console.log(`   가져옴: ${museums.length}, 신규: ${filtered.length} (누적: ${allNew.length + filtered.length})`);
            allNew.push(...filtered);
            filtered.forEach(m => {
                existingSet.add(m.name.toLowerCase().trim());
                existing.push({ name: m.name, latitude: m.latitude, longitude: m.longitude });
            });

            await new Promise(r => setTimeout(r, 3000));
        }
    }

    console.log(`\n=== Wikidata 총 가져옴: ${totalFetched} ===`);
    console.log(`=== 중복 제거 후 신규: ${allNew.length} ===`);

    const toInsert = allNew;
    console.log(`\n삽입 예정: ${toInsert.length}개`);

    let inserted = 0, errors = 0;
    for (const m of toInsert) {
        try {
            await pool.query(`
                INSERT INTO "Museum" (id, name, description, country, city, type, website, "imageUrl", latitude, longitude, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            `, [m.name, m.description || `${m.name} - ${m.type}`, m.country, m.city, m.type, m.website, m.imageUrl, m.latitude, m.longitude]);
            inserted++;
            if (inserted % 100 === 0) console.log(`  진행: ${inserted}/${toInsert.length}`);
        } catch (e) { errors++; }
    }

    console.log(`\n✅ 삽입 완료: ${inserted}개 (오류: ${errors}개)`);
    const { rows: [total] } = await pool.query('SELECT COUNT(*) as cnt FROM "Museum"');
    console.log(`📊 총 박물관 수: ${total.cnt}개`);
    pool.end();
}

main().catch(e => { console.error(e); pool.end(); });
