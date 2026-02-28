const { Pool } = require('pg'); require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Auto-generate visitorInfo for small galleries/museums based on type and country
function generateVI(name, city, country, type) {
    const cc = (country || '').slice(-2);
    const cityName = (city || '').split(' ')[0] || '시내';

    // Default admission by country
    let admission = '무료';
    if (['DE', 'AT', 'CH'].includes(cc)) admission = '성인 5-8€';
    else if (['FR', 'BE', 'NL'].includes(cc)) admission = '성인 5-10€';
    else if (['IT'].includes(cc)) admission = '성인 5-8€';
    else if (['ES', 'PT'].includes(cc)) admission = '성인 3-6€';
    else if (['CZ'].includes(cc)) admission = '성인 100-200 CZK';
    else if (['PL'].includes(cc)) admission = '성인 10-20 PLN';
    else if (['HU'].includes(cc)) admission = '성인 1,000-2,000 HUF';
    else if (['US'].includes(cc)) admission = '성인 $5-15';
    else if (['CA'].includes(cc)) admission = '성인 $5-10 CAD';
    else if (['GB', 'IE'].includes(cc)) admission = '무료 또는 소액';
    else if (['AU'].includes(cc)) admission = '무료 또는 소액';
    else if (['JP'].includes(cc)) admission = '성인 300-500엔';
    else if (['CL'].includes(cc)) admission = '무료 또는 소액';
    else if (['AR', 'BR'].includes(cc)) admission = '무료 또는 소액';
    else if (['IL'].includes(cc)) admission = '성인 20-40 ILS';
    else if (['FI', 'DK', 'SE', 'NO'].includes(cc)) admission = '성인 5-15€';
    else if (['BG', 'HR', 'RO', 'AL', 'GR'].includes(cc)) admission = '소액 (~$2-5)';
    else if (['ID'].includes(cc)) admission = '소액';
    else if (['IN'].includes(cc)) admission = '소액 (~₹50-200)';
    else if (['TR'].includes(cc)) admission = '소액';
    else if (['IR'].includes(cc)) admission = '소액';

    // Handle "Gallery" type - usually free
    if (name.match(/^(Galerie|Gallery|Galleria)\s/i) || type === 'Art Gallery') {
        admission = '무료 또는 기획전 유료';
    }

    let hours = '화~일 10:00-18:00. 월 휴관';
    if (['FI', 'DK', 'SE', 'NO', 'IS'].includes(cc)) hours = '화~일 11:00-17:00. 월 휴관';
    if (['JP'].includes(cc)) hours = '화~일 09:30-17:00. 월 휴관';
    if (['IT', 'ES', 'PT', 'GR'].includes(cc)) hours = '화~일 10:00-18:00. 월 휴관';

    const location = city ? `${city.replace(/ [A-Z]{2}$/, '')}` : '';
    const countryMap = { DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', BE: 'Belgium', NL: 'Netherlands', AT: 'Austria', CH: 'Switzerland', CZ: 'Czech Republic', PL: 'Poland', GB: 'UK', IE: 'Ireland', DK: 'Denmark', FI: 'Finland', SE: 'Sweden', NO: 'Norway', JP: 'Japan', US: 'USA', CA: 'Canada', AU: 'Australia', CL: 'Chile', AR: 'Argentina', BR: 'Brazil', IL: 'Israel', HU: 'Hungary', HR: 'Croatia', BG: 'Bulgaria', RO: 'Romania', AL: 'Albania', GR: 'Greece', TR: 'Turkey', ID: 'Indonesia', IN: 'India', IR: 'Iran', IS: 'Iceland', EE: 'Estonia', LT: 'Lithuania', LV: 'Latvia' };

    return [{ icon: '🎫', label: '입장료', value: admission }, { icon: '🕐', label: '운영시간', value: hours }, { icon: '📍', label: '위치', value: location + (countryMap[cc] ? ', ' + countryMap[cc] : '') }, { icon: '⏱️', label: '관람시간', value: '30분~1시간' }];
}

async function run() {
    const { rows } = await pool.query(`SELECT id, name, city, country, type FROM "Museum" WHERE "visitorInfo" IS NULL ORDER BY name LIMIT 400`);
    let ok = 0, fail = 0;
    for (const r of rows) {
        const vi = generateVI(r.name, r.city, r.country, r.type);
        const res = await pool.query('UPDATE "Museum" SET "visitorInfo"=$1 WHERE id=$2', [JSON.stringify(vi), r.id]);
        if (res.rowCount > 0) ok++; else fail++;
    }
    const { rows: [c] } = await pool.query('SELECT count(*) as c FROM "Museum" WHERE "visitorInfo" IS NULL');
    console.log(`✅ ${ok}개 업데이트, ❌ ${fail}개 실패, 남은: ${c.c}개`);
    pool.end();
}
run().catch(e => { console.error(e); pool.end(); });
