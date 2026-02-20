import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

// SPARQL Query: Fetch modern/contemporary art museums and art centers with coordinates
const SPARQL_QUERY = `
SELECT ?museum ?museumLabel ?museumDescription ?website ?coords ?type WHERE {
  # Q19812695: contemporary art museum, Q113426514: modern art museum, Q17502781: art center
  VALUES ?type { wd:Q19812695 wd:Q113426514 wd:Q17502781 }
  
  # Instance of or subclass of the types
  ?museum wdt:P31/wdt:P279* ?type .
  
  # Must have coordinate location
  ?museum wdt:P625 ?coords .
  
  # Optional website
  OPTIONAL { ?museum wdt:P856 ?website . }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 200 # Limiting for MVP demonstration
`;

async function fetchWikidataMuseums() {
    console.log('Fetching museum candidates from Wikidata...');
    const res = await fetch(`${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(SPARQL_QUERY)}`, {
        headers: {
            'Accept': 'application/sparql-results+json',
            'User-Agent': 'MuseumMapMVP/1.0 (contact@example.com)' // Good practice for Wikidata
        }
    });

    if (!res.ok) {
        throw new Error(`Wikidata query failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.results.bindings;
}

function parseCoordinates(pointString: string) {
    // Point(Longitude Latitude) format from Wikidata
    const match = pointString.match(/Point\(([^ ]+) ([^ ]+)\)/);
    if (match) {
        return {
            lng: parseFloat(match[1]),
            lat: parseFloat(match[2])
        };
    }
    return null;
}

function determineMuseumType(typeUri: string, label: string) {
    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel.includes('contemporary') && normalizedLabel.includes('modern')) {
        return 'Modern & Contemporary';
    } else if (typeUri.includes('Q19812695') || normalizedLabel.includes('contemporary')) {
        return 'Contemporary';
    } else if (typeUri.includes('Q113426514') || normalizedLabel.includes('modern')) {
        return 'Modern';
    } else if (typeUri.includes('Q17502781')) {
        return 'Art Center';
    }

    return 'Unknown';
}

async function run() {
    try {
        const records = await fetchWikidataMuseums();
        console.log(`Received ${records.length} records. Processing...`);

        let imported = 0;

        for (const record of records) {
            const pUrl = record.museum.value;
            const wikiId = pUrl.split('/').pop() as string;
            const name = record.museumLabel?.value || 'Unknown Museum';
            const description = record.museumDescription?.value || null;
            const website = record.website?.value || null;
            const pt = record.coords?.value;
            const typeUri = record.type?.value || '';

            if (!pt) continue; // Skip if no coordinates (redundant due to sparql, but safe)

            const coords = parseCoordinates(pt);
            if (!coords) continue;

            const museumType = determineMuseumType(typeUri, name);

            // We use a predefined location fallback for missing country/city in this simple script 
            // (Geocoding usually resolves this via PostGIS or a reverse-geocode API later)
            const country = 'Global'; // Placeholder
            const city = 'Various';   // Placeholder

            // Upsert into Database with PostGIS Raw SQL execution for the location geometry
            const existing = await prisma.museum.findFirst({
                where: { name } // Using Name as simple deduplication for MVP without a dedicated wikidata_id column
            });

            if (!existing) {
                // Create new museum
                await prisma.$executeRaw`
          INSERT INTO "Museum" (
            "id", "name", "description", "website", "type", "country", "city",
            "latitude", "longitude", "location", "updatedAt"
          )
          VALUES (
            gen_random_uuid(), ${name}, ${description}, ${website}, ${museumType},
            ${country}, ${city}, ${coords.lat}, ${coords.lng},
            ST_SetSRID(ST_Point(${coords.lng}, ${coords.lat}), 4326),
            NOW()
          )
        `;
                imported++;
                console.log(`✅ Imported: ${name}`);
            } else {
                // Skip or update logic for existing
                // console.log(`⚡ Skipped (Exists): ${name}`);
            }
        }

        console.log(`\n🎉 Pipeline Completed! Inserted ${imported} new museums.`);
    } catch (error) {
        console.error('Data Pipeline Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute script if run directly
if (require.main === module) {
    run();
}
