#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SPARQL_QUERY = `
SELECT DISTINCT
  ?museum ?museumLabel ?website ?image
WHERE {
  VALUES ?museumType {
    wd:Q207694      # art museum
    wd:Q2772772     # modern art museum
    wd:Q1007870     # contemporary art gallery
    wd:Q16735822    # contemporary art museum
  }
  ?museum wdt:P31 ?museumType .

  OPTIONAL { ?museum wdt:P856 ?website . }
  OPTIONAL { ?museum wdt:P18 ?image . }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko,ja,fr,de,es,pt,zh" . }
}
LIMIT 5000
`;

async function fetchWikidata() {
    const url = 'https://query.wikidata.org/sparql';
    const params = new URLSearchParams({
        query: SPARQL_QUERY,
        format: 'json',
    });

    const response = await fetch(`${url}?${params}`, {
        headers: {
            'User-Agent': 'MuseumMapBot/1.0',
            'Accept': 'application/sparql-results+json',
        },
    });

    if (!response.ok) throw new Error(`Wikidata failed: ${response.status}`);
    const data = await response.json();
    return data.results.bindings;
}

async function main() {
    const results = await fetchWikidata();
    console.log(`Fetched ${results.length} records from Wikidata`);

    const wikiMap = new Map();
    for (const r of results) {
        const name = r.museumLabel.value;
        wikiMap.set(name, {
            website: r.website?.value,
            image: r.image?.value
        });
    }

    const museums = await prisma.museum.findMany({
        select: { id: true, name: true, website: true, imageUrl: true }
    });

    let updated = 0;
    for (const m of museums) {
        const wiki = wikiMap.get(m.name);
        if (wiki) {
            const updates: any = {};
            if (!m.website && wiki.website) updates.website = wiki.website;
            if (!m.imageUrl && wiki.image) updates.imageUrl = wiki.image;

            if (Object.keys(updates).length > 0) {
                await prisma.museum.update({
                    where: { id: m.id },
                    data: updates
                });
                updated++;
            }
        }
    }

    console.log(`Updated ${updated} museums with missing data`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
