const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3
});

const COUNTRY_NAMES = {
    'AF': 'Afghanistan', 'AL': 'Albania', 'DZ': 'Algeria', 'AR': 'Argentina', 'AU': 'Australia',
    'AT': 'Austria', 'BE': 'Belgium', 'BR': 'Brazil', 'BG': 'Bulgaria', 'CA': 'Canada',
    'CL': 'Chile', 'CN': 'China', 'CO': 'Colombia', 'HR': 'Croatia', 'CZ': 'Czech Republic',
    'DK': 'Denmark', 'EC': 'Ecuador', 'EE': 'Estonia', 'EG': 'Egypt', 'FI': 'Finland',
    'FR': 'France', 'DE': 'Germany', 'GR': 'Greece', 'HU': 'Hungary', 'IS': 'Iceland',
    'IN': 'India', 'ID': 'Indonesia', 'IR': 'Iran', 'IQ': 'Iraq', 'IE': 'Ireland',
    'IL': 'Israel', 'IT': 'Italy', 'JP': 'Japan', 'KE': 'Kenya', 'KR': 'South Korea',
    'LV': 'Latvia', 'LT': 'Lithuania', 'LU': 'Luxembourg', 'MY': 'Malaysia', 'MX': 'Mexico',
    'MA': 'Morocco', 'NL': 'Netherlands', 'NZ': 'New Zealand', 'NG': 'Nigeria', 'NO': 'Norway',
    'PK': 'Pakistan', 'PE': 'Peru', 'PH': 'Philippines', 'PL': 'Poland', 'PT': 'Portugal',
    'RO': 'Romania', 'RU': 'Russia', 'SA': 'Saudi Arabia', 'RS': 'Serbia', 'SG': 'Singapore',
    'SK': 'Slovakia', 'SI': 'Slovenia', 'ZA': 'South Africa', 'ES': 'Spain', 'SE': 'Sweden',
    'CH': 'Switzerland', 'TW': 'Taiwan', 'TH': 'Thailand', 'TN': 'Tunisia', 'TR': 'Turkey',
    'UA': 'Ukraine', 'AE': 'UAE', 'GB': 'United Kingdom', 'US': 'United States',
    'VE': 'Venezuela', 'VN': 'Vietnam', 'BO': 'Bolivia', 'UY': 'Uruguay', 'PY': 'Paraguay',
    'CU': 'Cuba', 'DO': 'Dominican Republic', 'GT': 'Guatemala', 'HN': 'Honduras',
    'PA': 'Panama', 'CR': 'Costa Rica', 'JM': 'Jamaica', 'TT': 'Trinidad and Tobago',
    'GH': 'Ghana', 'TZ': 'Tanzania', 'UG': 'Uganda', 'ET': 'Ethiopia', 'CM': 'Cameroon',
    'SN': 'Senegal', 'CI': 'Ivory Coast', 'MG': 'Madagascar', 'MZ': 'Mozambique',
    'AO': 'Angola', 'ZW': 'Zimbabwe', 'NA': 'Namibia', 'BW': 'Botswana',
    'LK': 'Sri Lanka', 'NP': 'Nepal', 'BD': 'Bangladesh', 'MM': 'Myanmar',
    'KH': 'Cambodia', 'LA': 'Laos', 'MN': 'Mongolia', 'KZ': 'Kazakhstan',
    'GE': 'Georgia', 'AM': 'Armenia', 'AZ': 'Azerbaijan', 'UZ': 'Uzbekistan',
    'CY': 'Cyprus', 'MT': 'Malta', 'ME': 'Montenegro', 'MK': 'North Macedonia',
    'BA': 'Bosnia and Herzegovina', 'MD': 'Moldova', 'BY': 'Belarus', 'XK': 'Kosovo',
    'LI': 'Liechtenstein', 'MC': 'Monaco', 'SM': 'San Marino', 'AD': 'Andorra',
    'KP': 'North Korea', 'QA': 'Qatar', 'KW': 'Kuwait', 'BH': 'Bahrain', 'OM': 'Oman',
    'JO': 'Jordan', 'LB': 'Lebanon', 'SY': 'Syria', 'YE': 'Yemen', 'PS': 'Palestine',
};

async function main() {
    console.log('=== 1. 이름 중복 제거 ===');

    // Delete exact name duplicates (keep the one with best data)
    const dupeNames = await pool.query(`
        SELECT name, array_agg(id ORDER BY 
            CASE WHEN description IS NOT NULL AND LENGTH(description) > 50 THEN 0 ELSE 1 END,
            CASE WHEN "imageUrl" IS NOT NULL THEN 0 ELSE 1 END,
            CASE WHEN website IS NOT NULL THEN 0 ELSE 1 END
        ) as ids
        FROM "Museum" 
        GROUP BY name 
        HAVING COUNT(*) > 1
    `);

    let deletedDupes = 0;
    for (const row of dupeNames.rows) {
        // Keep first (best), delete rest
        const idsToDelete = row.ids.slice(1);
        if (idsToDelete.length > 0) {
            // First delete related records
            for (const table of ['Save', 'Review', 'Suggestion', 'PlanStop', 'CollectionItem', 'StoryMuseum', 'Exhibition']) {
                await pool.query(`DELETE FROM "${table}" WHERE "museumId" = ANY($1)`, [idsToDelete]);
            }
            const r = await pool.query('DELETE FROM "Museum" WHERE id = ANY($1)', [idsToDelete]);
            deletedDupes += r.rowCount;
        }
    }
    console.log(`  삭제: ${deletedDupes}개 중복`);

    console.log('\n=== 2. 좌표 근접 중복 제거 (50m 이내, 다른 이름) ===');
    // These are likely the same place with different names
    const nearby = await pool.query(`
        SELECT a.id, a.name, b.id as b_id, b.name as b_name,
               LENGTH(COALESCE(a.description,'')) as a_desc_len,
               LENGTH(COALESCE(b.description,'')) as b_desc_len
        FROM "Museum" a, "Museum" b
        WHERE a.id < b.id
          AND ABS(a.latitude - b.latitude) < 0.0003
          AND ABS(a.longitude - b.longitude) < 0.0003
          AND LOWER(a.name) != LOWER(b.name)
    `);
    let deletedNearby = 0;
    for (const row of nearby.rows) {
        // Keep the one with longer description
        const deleteId = row.a_desc_len >= row.b_desc_len ? row.b_id : row.id;
        try {
            for (const table of ['Save', 'Review', 'Suggestion', 'PlanStop', 'CollectionItem', 'StoryMuseum', 'Exhibition']) {
                await pool.query(`DELETE FROM "${table}" WHERE "museumId" = $1`, [deleteId]);
            }
            await pool.query('DELETE FROM "Museum" WHERE id = $1', [deleteId]);
            deletedNearby++;
        } catch (e) { }
    }
    console.log(`  삭제: ${deletedNearby}개 좌표 근접 중복`);

    console.log('\n=== 3. Description 국가코드 → 국가명 교체 ===');
    let fixedDesc = 0;
    const allMuseums = await pool.query('SELECT id, description, country FROM "Museum" WHERE description IS NOT NULL');
    for (const m of allMuseums.rows) {
        let desc = m.description;
        const countryName = COUNTRY_NAMES[m.country];
        if (!countryName) continue;

        // Replace patterns like "in City, FI," or "in City, FI "
        const cc = m.country;
        const regex = new RegExp(`, ${cc}([,\\s\\.])`, 'g');
        if (regex.test(desc)) {
            const newDesc = desc.replace(new RegExp(`, ${cc}([,\\s\\.])`, 'g'), `, ${countryName}$1`);
            // Also replace trailing ", CC" at end of string
            const finalDesc = newDesc.replace(new RegExp(`, ${cc}$`), `, ${countryName}`);
            await pool.query('UPDATE "Museum" SET description = $1 WHERE id = $2', [finalDesc, m.id]);
            fixedDesc++;
        }
    }
    console.log(`  수정: ${fixedDesc}개 description`);

    const { rows: [total] } = await pool.query('SELECT COUNT(*) as cnt FROM "Museum"');
    console.log(`\n📊 최종 박물관 수: ${total.cnt}개`);
    pool.end();
}

main().catch(e => { console.error(e); pool.end(); });
