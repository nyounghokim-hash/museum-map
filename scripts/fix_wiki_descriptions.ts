import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchWikiSummaryDetailed(museumName: string, city: string, country: string): Promise<string | null> {
    try {
        // Enforce strong location binding avoiding unrelated terms (e.g Lviv Arsenal in Ukraine)
        const countryTerm = country !== 'Global' && country !== 'Various' ? country : '';
        const cityTerm = city !== 'Various' ? city : '';

        let searchQuery = encodeURIComponent(`${museumName} ${cityTerm} ${countryTerm}`.trim());
        let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json`;

        let searchRes = await fetch(searchUrl);
        let searchData = await searchRes.json();

        // Loosen up if we miss with both city and country, search by Name + Country
        if (!searchData.query || searchData.query.search.length === 0) {
            searchQuery = encodeURIComponent(`${museumName} ${countryTerm}`.trim());
            searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json`;
            searchRes = await fetch(searchUrl);
            searchData = await searchRes.json();
        }

        if (searchData.query && searchData.query.search.length > 0) {
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

async function fixSpecificMuseums() {
    // Specifically fix Lviv Arsenal and any other completely mismatched generic descriptions
    console.log("Starting targeted Wikipedia fix script...");
    const targets = await prisma.museum.findMany({
        where: {
            OR: [
                { name: { contains: 'Lviv Arsenal' } },
                { description: { contains: 'Massachusetts' } },
                { description: { contains: 'Australia' } }
            ]
        }
    });

    console.log(`Found ${targets.length} museums flagged with bad descriptions.`);
    let fixed = 0;

    for (const museum of targets) {
        console.log(`Fixing ${museum.name} in ${museum.city}, ${museum.country}...`);
        const newDesc = await fetchWikiSummaryDetailed(museum.name, museum.city || '', museum.country || '');

        if (newDesc) {
            console.log(`-> Replaced with explicit country lookup extract.`);
            await prisma.museum.update({
                where: { id: museum.id },
                data: { description: newDesc.substring(0, 1500) }
            });
            fixed++;
        } else {
            console.log(`-> Wiki extraction failed. Forcing manual generated fallback.`);
            const fallback = `${museum.name} is a renowned institution located in ${museum.city !== 'Various' ? museum.city + ', ' : ''}${museum.country !== 'Global' ? museum.country : 'the world'}. It offers a unique collection and exhibitions dedicated to preserving and showcasing significant cultural and artistic heritage.`;
            await prisma.museum.update({
                where: { id: museum.id },
                data: { description: fallback }
            });
            fixed++;
        }
        await new Promise(r => setTimeout(r, 300));
    }

    // As a secondary sweep, fix museums that talk about unrelated US states when they are not in the US
    const badUSMatches = await prisma.museum.findMany({
        where: {
            country: { notIn: ['US', 'United States', 'USA', 'America'] },
            description: { contains: 'Massachusetts', mode: 'insensitive' }
        }
    });

    for (const museum of badUSMatches) {
        console.log(`Fixing misplaced region descriptions: ${museum.name} in ${museum.country}`);
        const fallback = `${museum.name} is a renowned cultural institution located in ${museum.city !== 'Various' ? museum.city + ', ' : ''}${museum.country}. It preserves and showcases collections that are historically significant to the region.`;
        await prisma.museum.update({
            where: { id: museum.id },
            data: { description: fallback }
        });
        fixed++;
    }

    console.log(`\\nCompleted. Fixed ${fixed} incorrect entries.`);
}

fixSpecificMuseums()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
