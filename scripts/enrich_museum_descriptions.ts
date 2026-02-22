import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchWikiSummary(museumName: string, city: string): Promise<string | null> {
    try {
        // Try precise search first
        let searchQuery = encodeURIComponent(`${museumName} ${city && city !== 'Various' ? city : ''}`);
        let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json`;

        let searchRes = await fetch(searchUrl);
        let searchData = await searchRes.json();

        // If no results, try just the museum name
        if (!searchData.query || searchData.query.search.length === 0) {
            searchQuery = encodeURIComponent(museumName);
            searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json`;
            searchRes = await fetch(searchUrl);
            searchData = await searchRes.json();
        }

        if (searchData.query && searchData.query.search.length > 0) {
            // Get the best match title
            const bestMatch = searchData.query.search[0].title;
            const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`;
            const summaryRes = await fetch(summaryUrl);
            const summaryData = await summaryRes.json();

            if (summaryData.extract && summaryData.extract.length > 40) {
                return summaryData.extract;
            }
        }
        return null;
    } catch (error: any) {
        return null;
    }
}

async function main() {
    const museums = await prisma.museum.findMany();

    console.log(`Found ${museums.length} museums. Starting reliable Wikipedia extraction...`);
    let updated = 0;

    // Process in batches of 10 to respect Wikipedia API limits
    const batchSize = 10;
    for (let i = 0; i < museums.length; i += batchSize) {
        const batch = museums.slice(i, i + batchSize);
        process.stdout.write(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(museums.length / batchSize)}... `);

        let batchUpdated = 0;
        await Promise.all(batch.map(async (museum) => {
            // We want to replace descriptions that are too short (< 120 chars are usually Wikidata stubs)
            if (!museum.description || museum.description.length < 120) {
                const description = await fetchWikiSummary(museum.name, museum.city || '');

                if (description) {
                    await prisma.museum.update({
                        where: { id: museum.id },
                        data: { description: description.substring(0, 1500) }
                    });
                    batchUpdated++;
                    updated++;
                } else {
                    // Fallback factual generation using name and type if Wiki fails and it's completely empty
                    if (!museum.description || museum.description.length < 10) {
                        const fallback = `${museum.name} is a renowned ${museum.type?.toLowerCase() || 'art'} institution located in ${museum.city !== 'Various' ? museum.city + ', ' : ''}${museum.country !== 'Global' ? museum.country : 'the world'}. It offers a unique collection and exhibitions dedicated to preserving and showcasing significant cultural and artistic heritage.`;
                        await prisma.museum.update({
                            where: { id: museum.id },
                            data: { description: fallback }
                        });
                        batchUpdated++;
                        updated++;
                    }
                }
            }
        }));

        console.log(`Updated ${batchUpdated} items.`);
        // Wait 500ms between batches to prevent 429 errors
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\\nFinished! Total museums enriched this run: ${updated}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
