const { Pool } = require('pg'); require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const d = {
    // ★★★ World-class
    'Hamburger Bahnhof': { vi: [{ icon: '🎫', label: '입장료', value: '성인 14€, 학생 7€. 매월 첫 일 무료' }, { icon: '🕐', label: '운영시간', value: '화~금 10:00-18:00, 토·일 11:00-18:00 (목 ~20:00). 월 휴관' }, { icon: '📍', label: '위치', value: 'Invalidenstraße 50-51, Berlin, Germany' }, { icon: '🚇', label: '교통', value: 'S-Bahn Hauptbahnhof 도보 5분. 보이스·키퍼·워홀 현대미술' }, { icon: '⏱️', label: '관람시간', value: '2시간' }] },
    'Grotte Chauvet 2 - Ardèche': { vi: [{ icon: '🎫', label: '입장료', value: '성인 17€' }, { icon: '🕐', label: '운영시간', value: '매일 10:00-18:00 (하계 09:00-19:00)' }, { icon: '📍', label: '위치', value: 'Plateau du Razal, Vallon-Pont-d\'Arc, Ardèche, France' }, { icon: '🚇', label: '교통', value: '발랑스에서 차량 1.5시간. 3만 6천년 동굴벽화 복제' }, { icon: '⏱️', label: '관람시간', value: '2시간' }] },
    'Great North Museum': { vi: [{ icon: '🎫', label: '입장료', value: '무료' }, { icon: '🕐', label: '운영시간', value: '월~금 10:00-17:00, 토 10:00-16:00. 일 휴관' }, { icon: '📍', label: '위치', value: 'Barras Bridge, Newcastle upon Tyne, UK' }, { icon: '🚇', label: '교통', value: 'Metro Haymarket역 도보 5분. 하드리아누스 성벽 유물' }, { icon: '⏱️', label: '관람시간', value: '1.5시간' }] },
    'Hakutsuru Fine Art Museum': { vi: [{ icon: '🎫', label: '입장료', value: '성인 500엔' }, { icon: '🕐', label: '운영시간', value: '화~일 10:00-16:30 (입장 ~16:00). 월 휴관' }, { icon: '📍', label: '위치', value: 'Sumiyoshi Yamate, Higashinada-ku, Kobe, Japan' }, { icon: '🚇', label: '교통', value: '한큐 스미요시역 도보 5분. 하쿠츠루 주조 회사 컬렉션' }, { icon: '⏱️', label: '관람시간', value: '1시간' }] },
    'Gunma Museum of Art, Tatebayashi': { vi: [{ icon: '🎫', label: '입장료', value: '성인 310엔' }, { icon: '🕐', label: '운영시간', value: '매일 09:30-17:00. 월 휴관' }, { icon: '📍', label: '위치', value: 'Tatebayashi, Gunma, Japan' }, { icon: '🚇', label: '교통', value: '도부철도 다테바야시역 버스. 프랑수아 밀레' }, { icon: '⏱️', label: '관람시간', value: '1시간' }] },
    'Gunma Museum of Natural History': { vi: [{ icon: '🎫', label: '입장료', value: '성인 510엔' }, { icon: '🕐', label: '운영시간', value: '매일 09:30-17:00. 월 휴관' }, { icon: '📍', label: '위치', value: 'Tomioka, Gunma, Japan' }, { icon: '🚇', label: '교통', value: 'JR 다카사키역 버스. 공룡 실물대 복원' }, { icon: '⏱️', label: '관람시간', value: '1.5시간' }] },
    'Groß Raden Archaeological Open Air Museum': { vi: [{ icon: '🎫', label: '입장료', value: '성인 5€' }, { icon: '🕐', label: '운영시간', value: '4~10월 화~일 10:00-17:30' }, { icon: '📍', label: '위치', value: 'Groß Raden, Mecklenburg, Germany' }, { icon: '🚇', label: '교통', value: '슈베린에서 차량 40분. 슬라브 정착지 복원' }, { icon: '⏱️', label: '관람시간', value: '1.5시간' }] },
    'Grotta Gigante / Bri?ka jama': { vi: [{ icon: '🎫', label: '입장료', value: '성인 14€' }, { icon: '🕐', label: '운영시간', value: '화~일 10:00-16:00 (하계 ~18:00). 월 휴관' }, { icon: '📍', label: '위치', value: 'Sgonico, Trieste, Italy' }, { icon: '🚇', label: '교통', value: '트리에스테에서 차량 15분. 세계 최대 관광 동굴' }, { icon: '⏱️', label: '관람시간', value: '1시간' }] },
    'Hall of Fame': { vi: [{ icon: '🎫', label: '입장료', value: '무료' }, { icon: '🕐', label: '운영시간', value: '매일 09:00-19:00' }, { icon: '📍', label: '위치', value: 'Leh, Ladakh, India' }, { icon: '🚇', label: '교통', value: '레 시내. 인도 육군 전쟁 박물관' }, { icon: '⏱️', label: '관람시간', value: '1시간' }] },
    'Hall of Arts': { vi: [{ icon: '🎫', label: '입장료', value: '기획전 유료' }, { icon: '🕐', label: '운영시간', value: '화~일 10:00-18:00 (목 ~20:00). 월 휴관' }, { icon: '📍', label: '위치', value: 'Heroes\' Square, Budapest, Hungary' }, { icon: '🚇', label: '교통', value: '메트로 M1 Hősök Tere역. 영웅광장' }, { icon: '⏱️', label: '관람시간', value: '1시간' }] },
    'Halle Gate Museum': { vi: [{ icon: '🎫', label: '입장료', value: '무료' }, { icon: '🕐', label: '운영시간', value: '화~금 09:30-17:00, 토·일 10:00-17:00. 월 휴관' }, { icon: '📍', label: '위치', value: 'Boulevard du Midi, Brussels, Belgium' }, { icon: '🚇', label: '교통', value: '프레메트로 Porte de Hal역. 14세기 성문' }, { icon: '⏱️', label: '관람시간', value: '1시간' }] },
};
async function run() {
    let ok = 0, fail = 0;
    for (const [name, info] of Object.entries(d)) {
        const vi = JSON.stringify(info.vi);
        const r = await pool.query('UPDATE "Museum" SET "visitorInfo"=$1 WHERE name=$2 AND "visitorInfo" IS NULL RETURNING id', [vi, name]);
        if (r.rowCount > 0) ok += r.rowCount; else fail++;
    }
    const { rows: [c] } = await pool.query('SELECT count(*) as c FROM "Museum" WHERE "visitorInfo" IS NULL');
    console.log(`✅ ${ok}개 업데이트, ❌ ${fail}개 불일치, 남은: ${c.c}개`);
    pool.end();
}
run().catch(e => { console.error(e); pool.end(); });
