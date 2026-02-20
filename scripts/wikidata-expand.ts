#!/usr/bin/env npx tsx
/**
 * Wikidata SPARQL Pipeline — Auto-expand museum database
 *
 * Queries Wikidata for contemporary/modern art museums worldwide
 * and upserts them into the PostgreSQL database via Prisma.
 *
 * Usage:
 *   NODE_OPTIONS="--dns-result-order=ipv4first" npx tsx scripts/wikidata-expand.ts
 *
 * This will:
 *   1. Query Wikidata SPARQL endpoint for art museums with coordinates
 *   2. Parse and deduplicate results
 *   3. Upsert into the Museum table (skip existing by name)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════
// SPARQL query: All modern/contemporary art museums with coords
// ═══════════════════════════════════════════════════════════
const SPARQL_QUERY = `
SELECT DISTINCT
  ?museum ?museumLabel ?countryLabel ?cityLabel
  ?coord ?website
WHERE {
  # Only modern/contemporary museum types — no classical museums
  VALUES ?museumType {
    wd:Q207694      # art museum
    wd:Q2772772     # modern art museum
    wd:Q1007870     # contemporary art gallery
    wd:Q16735822    # contemporary art museum
  }
  ?museum wdt:P31 ?museumType .

  # Must have coordinates
  ?museum wdt:P625 ?coord .

  # Country
  ?museum wdt:P17 ?country .

  # City (optional)
  OPTIONAL { ?museum wdt:P131 ?city . }

  # Website (optional)
  OPTIONAL { ?museum wdt:P856 ?website . }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko,ja,fr,de,es,pt,zh" . }
}
ORDER BY ?countryLabel ?museumLabel
LIMIT 2000
`;

interface WikidataResult {
    museum: { value: string };
    museumLabel: { value: string };
    countryLabel: { value: string };
    cityLabel?: { value: string };
    coord: { value: string }; // "Point(lng lat)"
    website?: { value: string };
}

function parseCoordinates(pointStr: string): { lat: number; lng: number } | null {
    // Format: "Point(lng lat)"
    const match = pointStr.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
    if (!match) return null;
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

function countryNameToISO(name: string): string {
    // Common country name → ISO 3166-1 alpha-2 mapping
    const map: Record<string, string> = {
        "United States of America": "US", "United States": "US",
        "United Kingdom": "GB", "France": "FR", "Germany": "DE",
        "Italy": "IT", "Spain": "ES", "Netherlands": "NL",
        "Belgium": "BE", "Switzerland": "CH", "Austria": "AT",
        "Denmark": "DK", "Sweden": "SE", "Finland": "FI",
        "Norway": "NO", "Estonia": "EE", "Lithuania": "LT",
        "Latvia": "LV", "Poland": "PL", "Czech Republic": "CZ",
        "Czechia": "CZ", "Hungary": "HU", "Romania": "RO",
        "Portugal": "PT", "Ireland": "IE", "Greece": "GR",
        "Turkey": "TR", "Japan": "JP", "South Korea": "KR",
        "Republic of Korea": "KR", "China": "CN",
        "People's Republic of China": "CN",
        "Taiwan": "TW", "Hong Kong": "HK", "Singapore": "SG",
        "India": "IN", "Thailand": "TH", "Indonesia": "ID",
        "Vietnam": "VN", "Philippines": "PH", "Malaysia": "MY",
        "Australia": "AU", "New Zealand": "NZ",
        "Canada": "CA", "Mexico": "MX", "Brazil": "BR",
        "Argentina": "AR", "Chile": "CL", "Colombia": "CO",
        "Peru": "PE", "South Africa": "ZA", "Morocco": "MA",
        "Egypt": "EG", "Nigeria": "NG", "Kenya": "KE",
        "Qatar": "QA", "United Arab Emirates": "AE",
        "Israel": "IL", "Lebanon": "LB", "Russia": "RU",
        "Ukraine": "UA", "Croatia": "HR", "Serbia": "RS",
        "Slovenia": "SI", "Slovakia": "SK", "Bulgaria": "BG",
        "Luxembourg": "LU", "Iceland": "IS",
    };
    return map[name] || name.substring(0, 2).toUpperCase();
}

async function fetchWikidata(): Promise<WikidataResult[]> {
    const url = 'https://query.wikidata.org/sparql';
    const params = new URLSearchParams({
        query: SPARQL_QUERY,
        format: 'json',
    });

    console.log('Fetching from Wikidata SPARQL...');
    const response = await fetch(`${url}?${params}`, {
        headers: {
            'User-Agent': 'MuseumMapBot/1.0 (https://github.com/museum-map)',
            'Accept': 'application/sparql-results+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Wikidata query failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.bindings as WikidataResult[];
}

async function main() {
    const results = await fetchWikidata();
    console.log(`Received ${results.length} results from Wikidata`);

    // Deduplicate by museum name
    const seen = new Set<string>();
    const unique: WikidataResult[] = [];
    for (const r of results) {
        const name = r.museumLabel.value;
        if (!seen.has(name) && !name.startsWith('Q') /* skip unresolved QIDs */) {
            seen.add(name);
            unique.push(r);
        }
    }
    console.log(`${unique.length} unique museums after dedup`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const r of unique) {
        const name = r.museumLabel.value;
        const coords = parseCoordinates(r.coord.value);
        if (!coords) { errors++; continue; }

        const country = countryNameToISO(r.countryLabel.value);
        const city = r.cityLabel?.value || '';
        const website = r.website?.value || null;

        try {
            // Skip if already exists
            const exists = await prisma.museum.findFirst({ where: { name } });
            if (exists) { skipped++; continue; }

            const id = Math.random().toString(36).substring(2, 10);

            await prisma.$executeRaw`
        INSERT INTO "Museum" (
          "id", "name", "description", "country", "city", "type", "website",
          "latitude", "longitude", "location",
          "updatedAt"
        )
        VALUES (
          ${id}, ${name}, ${null}, ${country}, ${city}, ${'Public'},
          ${website},
          ${coords.lat}, ${coords.lng},
          ST_SetSRID(ST_Point(${coords.lng}, ${coords.lat}), 4326),
          NOW()
        )
      `;
            inserted++;
        } catch (err: any) {
            errors++;
            if (errors <= 5) console.error(`  Error inserting "${name}":`, err.message);
        }
    }

    console.log(`\nWikidata expansion complete:`);
    console.log(`  ✅ Inserted:  ${inserted}`);
    console.log(`  ⏭️  Skipped:   ${skipped} (already exist)`);
    console.log(`  ❌ Errors:    ${errors}`);
    console.log(`  📊 Total DB:  (run SELECT COUNT(*) FROM "Museum" to check)`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
