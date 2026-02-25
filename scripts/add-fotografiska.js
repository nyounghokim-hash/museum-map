const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3
});

const museums = [
    {
        name: 'Fotografiska Tallinn',
        description: 'Fotografiska Tallinn is a photography museum housed in a stunning art nouveau building in the heart of Tallinn, Estonia.',
        latitude: 59.4447, longitude: 24.7552,
        website: 'https://www.fotografiska.com/tll/',
        imageUrl: null,
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
        description: 'Fotografiska New York is a photography museum in Manhattan, New York.',
        latitude: 40.7392, longitude: -73.9903,
        website: 'https://www.fotografiska.com/nyc/',
        imageUrl: null,
        country: 'US', city: 'New York', type: 'Photography Museum'
    },
];

async function main() {
    let inserted = 0;
    for (const m of museums) {
        try {
            const { rows } = await pool.query('SELECT id FROM "Museum" WHERE name = $1', [m.name]);
            if (rows.length > 0) {
                console.log(`⏭️  이미 존재: ${m.name}`);
                continue;
            }
            await pool.query(`
                INSERT INTO "Museum" (id, name, description, country, city, type, website, "imageUrl", latitude, longitude, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            `, [m.name, m.description, m.country, m.city, m.type, m.website, m.imageUrl, m.latitude, m.longitude]);
            console.log(`✅ 추가: ${m.name}`);
            inserted++;
        } catch (e) {
            console.error(`❌ ${m.name}: ${e.message}`);
        }
    }
    const { rows: [total] } = await pool.query('SELECT COUNT(*) as cnt FROM "Museum"');
    console.log(`\n📊 총 박물관 수: ${total.cnt}개 (신규 ${inserted}개)`);
    pool.end();
}

main();
