const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3
});

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';

async function sparqlQuery(query) {
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(query)}&format=json`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'MuseumMap/1.0 (museum-map-enrichment)' },
                signal: AbortSignal.timeout(120000)
            });
            if (res.ok) return res.json();
            if (res.status === 429 || res.status >= 500) {
                console.log(`    ⏳ ${res.status} — 30초 후 재시도 (${attempt + 1}/3)...`);
                await new Promise(r => setTimeout(r, 30000));
                continue;
            }
            throw new Error(`SPARQL error: ${res.status}`);
        } catch (e) {
            if (attempt === 2) throw e;
            console.log(`    ⏳ Error — 20초 후 재시도 (${attempt + 1}/3)...`);
            await new Promise(r => setTimeout(r, 20000));
        }
    }
}

// Fetch museums from specific countries
async function fetchByCountry(countryQid, countryName, limit = 500) {
    const query = `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?lat ?lon ?website ?image ?countryCode ?cityLabel WHERE {
        VALUES ?type { wd:Q33506 wd:Q207694 wd:Q1970365 wd:Q1267914 wd:Q18674739 wd:Q16735822 wd:Q738570 wd:Q15206070 wd:Q4989906 wd:Q1329623 wd:Q2772772 wd:Q17431399 wd:Q856584 wd:Q928830 wd:Q1244442 wd:Q2772759 wd:Q3658341 wd:Q4287745 wd:Q1060829 wd:Q2087181 }
        ?item wdt:P31/wdt:P279* ?type.
        ?item wdt:P17 wd:${countryQid}.
        ?item wdt:P625 ?coord.
        BIND(geof:latitude(?coord) AS ?lat)
        BIND(geof:longitude(?coord) AS ?lon)
        OPTIONAL { ?item wdt:P856 ?website. }
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL { ?item wdt:P17 ?countryEntity. ?countryEntity wdt:P297 ?countryCode. }
        OPTIONAL { ?item wdt:P131 ?city. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko,ja,pt,es,fr". }
    }
    LIMIT ${limit}`;

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
            type: 'Museum',
            wikidataId: r.item?.value?.split('/').pop() || ''
        }));
    } catch (e) {
        console.error(`  ⚠️ Error for ${countryName}: ${e.message}`);
        return [];
    }
}

// Fetch by continent
async function fetchByContinent(continentQid, continentName) {
    const query = `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?lat ?lon ?website ?image ?countryCode ?cityLabel WHERE {
        VALUES ?type { wd:Q33506 wd:Q207694 wd:Q1970365 wd:Q18674739 wd:Q738570 wd:Q15206070 }
        ?item wdt:P31/wdt:P279* ?type.
        ?item wdt:P17 ?country.
        ?country wdt:P30 wd:${continentQid}.
        ?item wdt:P625 ?coord.
        BIND(geof:latitude(?coord) AS ?lat)
        BIND(geof:longitude(?coord) AS ?lon)
        OPTIONAL { ?item wdt:P856 ?website. }
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL { ?country wdt:P297 ?countryCode. }
        OPTIONAL { ?item wdt:P131 ?city. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko,ja,pt,es,fr". }
    }
    LIMIT 500`;

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
            type: 'Museum',
            wikidataId: r.item?.value?.split('/').pop() || ''
        }));
    } catch (e) {
        console.error(`  ⚠️ Error for ${continentName}: ${e.message}`);
        return [];
    }
}

async function main() {
    const { rows: existing } = await pool.query('SELECT name, latitude, longitude FROM "Museum"');
    const existingSet = new Set(existing.map(m => m.name.toLowerCase().trim()));
    console.log(`기존 박물관: ${existing.length}개\n`);

    let allNew = [];

    // ===== Manual additions =====
    const manual = [
        {
            name: 'Fotografiska Tallinn',
            description: 'Fotografiska Tallinn is a photography museum in Tallinn, Estonia, housed in a stunning art nouveau building.',
            latitude: 59.4447, longitude: 24.7552,
            website: 'https://www.fotografiska.com/tll/',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Fotografiska_Tallinn.jpg/1280px-Fotografiska_Tallinn.jpg',
            country: 'EE', city: 'Tallinn', type: 'Photography Museum'
        },
        {
            name: 'Fotografiska Stockholm',
            description: 'Fotografiska is a center for contemporary photography in Stockholm, Sweden.',
            latitude: 59.3178, longitude: 18.0852,
            website: 'https://www.fotografiska.com/sto/',
            imageUrl: null,
            country: 'SE', city: 'Stockholm', type: 'Photography Museum'
        },
        {
            name: 'Fotografiska New York',
            description: 'Fotografiska New York is a photography museum located in the Flatiron District of Manhattan.',
            latitude: 40.7392, longitude: -73.9903,
            website: 'https://www.fotografiska.com/nyc/',
            imageUrl: null,
            country: 'US', city: 'New York', type: 'Photography Museum'
        },
    ];

    for (const m of manual) {
        if (!existingSet.has(m.name.toLowerCase().trim())) {
            allNew.push(m);
            existingSet.add(m.name.toLowerCase().trim());
            existing.push({ name: m.name, latitude: m.latitude, longitude: m.longitude });
            console.log(`✨ 수동 추가: ${m.name}`);
        } else {
            console.log(`⏭️  이미 존재: ${m.name}`);
        }
    }

    // ===== Country-specific queries =====
    const countries = [
        { qid: 'Q884', name: '🇰🇷 한국', limit: 500 },
        { qid: 'Q17', name: '🇯🇵 일본', limit: 500 },
        { qid: 'Q148', name: '🇨🇳 중국', limit: 500 },
        { qid: 'Q869', name: '🇹🇭 태국', limit: 300 },
        { qid: 'Q252', name: '🇮🇩 인도네시아', limit: 300 },
        { qid: 'Q668', name: '🇮🇳 인도', limit: 300 },
        { qid: 'Q96', name: '🇲🇽 멕시코', limit: 300 },
        { qid: 'Q155', name: '🇧🇷 브라질', limit: 300 },
        { qid: 'Q414', name: '🇦🇷 아르헨티나', limit: 300 },
        { qid: 'Q298', name: '🇨🇱 칠레', limit: 200 },
        { qid: 'Q736', name: '🇪🇨 에콰도르', limit: 200 },
        { qid: 'Q419', name: '🇵🇪 페루', limit: 200 },
        { qid: 'Q750', name: '🇧🇴 볼리비아', limit: 200 },
        { qid: 'Q717', name: '🇻🇪 베네수엘라', limit: 200 },
        { qid: 'Q739', name: '🇨🇴 콜롬비아', limit: 200 },
        { qid: 'Q258', name: '🇿🇦 남아프리카', limit: 300 },
        { qid: 'Q114', name: '🇰🇪 케냐', limit: 200 },
        { qid: 'Q1033', name: '🇳🇬 나이지리아', limit: 200 },
        { qid: 'Q79', name: '🇪🇬 이집트', limit: 300 },
        { qid: 'Q1028', name: '🇲🇦 모로코', limit: 200 },
        { qid: 'Q948', name: '🇹🇳 튀니지', limit: 200 },
        { qid: 'Q865', name: '🇹🇼 대만', limit: 300 },
        { qid: 'Q423', name: '🇰🇵 북한', limit: 100 },
        { qid: 'Q334', name: '🇸🇬 싱가포르', limit: 200 },
        { qid: 'Q833', name: '🇲🇾 말레이시아', limit: 200 },
        { qid: 'Q928', name: '🇵🇭 필리핀', limit: 200 },
        { qid: 'Q881', name: '🇻🇳 베트남', limit: 200 },
    ];

    for (const c of countries) {
        console.log(`\n🔍 ${c.name}...`);
        const museums = await fetchByCountry(c.qid, c.name, c.limit);

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

        await new Promise(r => setTimeout(r, 5000));
    }

    // ===== Continent queries (Africa, South America) =====
    const continents = [
        { qid: 'Q15', name: '🌍 아프리카' },
        { qid: 'Q18', name: '🌎 남아메리카' },
        { qid: 'Q49', name: '🌏 오세아니아' },
    ];

    for (const c of continents) {
        console.log(`\n🔍 ${c.name} (대륙별)...`);
        const museums = await fetchByContinent(c.qid, c.name);

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

        await new Promise(r => setTimeout(r, 5000));
    }

    console.log(`\n=== 총 신규: ${allNew.length} ===`);
    console.log(`\n삽입 시작...`);

    let inserted = 0, errors = 0;
    for (const m of allNew) {
        try {
            await pool.query(`
                INSERT INTO "Museum" (id, name, description, country, city, type, website, "imageUrl", latitude, longitude, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            `, [m.name, m.description || `${m.name} - ${m.type}`, m.country, m.city, m.type, m.website, m.imageUrl, m.latitude, m.longitude]);
            inserted++;
            if (inserted % 100 === 0) console.log(`  진행: ${inserted}/${allNew.length}`);
        } catch (e) { errors++; }
    }

    console.log(`\n✅ 삽입 완료: ${inserted}개 (오류: ${errors}개)`);
    const { rows: [total] } = await pool.query('SELECT COUNT(*) as cnt FROM "Museum"');
    console.log(`📊 총 박물관 수: ${total.cnt}개`);
    pool.end();
}

main().catch(e => { console.error(e); pool.end(); });
