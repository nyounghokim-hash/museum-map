import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const prisma = new PrismaClient();
const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!SERPER_API_KEY) {
    console.error("❌ SERPER_API_KEY matches not found in .env");
    process.exit(1);
}

const BATCH_SIZE = 10; // 한 번에 처리할 개수
const DELAY_BETWEEN_BATCHES = 500; // 배치 사이 대기 시간 (ms)

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSerperData(museumName: string, city: string, country: string) {
    try {
        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", SERPER_API_KEY!);
        myHeaders.append("Content-Type", "application/json");

        // 1. Place Search (For website & opening hours)
        // Add country code and "country" keyword to explicitly prevent state abbreviation confusion (e.g. AZ = Azerbaijan vs Arizona)
        const countryContext = country ? `country code ${country}` : '';
        const placeQuery = `${museumName} in ${city} ${countryContext}`;
        const placeRes = await fetch("https://google.serper.dev/places", {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({ "q": placeQuery, "num": 1 }),
        });

        if (!placeRes.ok) {
            console.error(`❌ Place API error: ${placeRes.statusText}`);
            return null;
        }

        const placeData = await placeRes.json();
        const place = placeData.places?.[0];

        // 2. Organic Search (For exhibitions)
        const exhibitionQuery = `current exhibitions at ${museumName} official`;
        const organicRes = await fetch("https://google.serper.dev/search", {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({ "q": exhibitionQuery, "num": 5 }),
        });

        if (!organicRes.ok) {
            console.error(`❌ Search API error: ${organicRes.statusText}`);
            // We can still proceed if place data exists
        }

        const organicData = organicRes.ok ? await organicRes.json() : {};
        const exhibitions = organicData.organic?.map((item: any) => ({
            title: item.title.replace(`- ${museumName}`, '').replace(`| ${museumName}`, '').trim().substring(0, 100),
            description: item.snippet ? item.snippet.substring(0, 500) : null,
            link: item.link ? item.link.substring(0, 200) : null,
            imageUrl: item.imageUrl ? item.imageUrl.substring(0, 400) : null,
            source: 'SERPER'
        })) || [];

        return {
            website: place?.website || null,
            openingHours: place?.openingHours || null,
            exhibitions: exhibitions.slice(0, 3)
        };
    } catch (error) {
        console.error(`Error fetching Serper data for ${museumName}:`, error);
        return null;
    }
}

async function processMuseumBatch(museums: any[]) {
    const results = [];
    for (const museum of museums) {
        console.log(`🔍 Processing: ${museum.name} (${museum.city}, ${museum.country})`);
        const data = await fetchSerperData(museum.name, museum.city, museum.country);

        if (data) {
            try {
                // DB Update
                await prisma.$transaction([
                    prisma.museum.update({
                        where: { id: museum.id },
                        data: {
                            website: data.website || museum.website,
                            openingHours: data.openingHours || museum.openingHours,
                            lastExhibitionSync: new Date()
                        }
                    }),
                    prisma.exhibition.deleteMany({
                        where: { museumId: museum.id, source: 'SERPER' }
                    }),
                    prisma.exhibition.createMany({
                        data: data.exhibitions.map((ex: any) => ({ ...ex, museumId: museum.id }))
                    })
                ]);
                results.push({ id: museum.id, name: museum.name, status: 'success' });
                console.log(`✅ Updated ${museum.name}`);
            } catch (err) {
                console.error(`❌ Failed to update DB for ${museum.name}:`, err);
                results.push({ id: museum.id, name: museum.name, status: 'db_error' });
            }
        } else {
            results.push({ id: museum.id, name: museum.name, status: 'fetch_error' });
        }
        await sleep(200); // 박물관별 간격
    }
    return results;
}

async function main() {
    const museums = await prisma.museum.findMany({
        // order by popularity or created? 1481 is a lot, so we might need to handle this in chunks or separate runs
        orderBy: { updatedAt: 'asc' }
    });

    // Resume logic: load existing reports
    let processedIds = new Set<string>();
    if (fs.existsSync('serper_update_report.json')) {
        const existingReports = JSON.parse(fs.readFileSync('serper_update_report.json', 'utf8'));
        processedIds = new Set(existingReports.map((r: { id: string }) => r.id));
        console.log(`ℹ️ Found ${processedIds.size} already processed museums. Skipping them.`);
    }

    const targetMuseums = museums.filter(m => !processedIds.has(m.id));
    console.log(`🚀 Starting enrichment for ${targetMuseums.length} remaining museums...`);

    const allReports = fs.existsSync('serper_update_report.json')
        ? JSON.parse(fs.readFileSync('serper_update_report.json', 'utf8'))
        : [];

    const totalBatches = Math.ceil(targetMuseums.length / BATCH_SIZE);

    for (let i = 0; i < targetMuseums.length; i += BATCH_SIZE) {
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const batch = targetMuseums.slice(i, i + BATCH_SIZE);
        console.log(`\n📦 Batch ${batchNumber}/${totalBatches}`);

        const batchResults = await processMuseumBatch(batch);
        allReports.push(...batchResults);

        // 정기적으로 리포트 파일 업데이트
        fs.writeFileSync('serper_update_report.json', JSON.stringify(allReports, null, 2));

        await sleep(DELAY_BETWEEN_BATCHES);
    }

    console.log(`\n🎉 Finished! Updated: ${allReports.filter((r: any) => r.status === 'success').length}/${allReports.length}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
