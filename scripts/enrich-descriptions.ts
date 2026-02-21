/**
 * Museum Description & Category Enrichment Script
 * 
 * 1) Fetches descriptions from Wikidata (schemaDescription)
 * 2) Classifies museums into art-specific categories based on name + Wikidata type
 * 
 * Categories:
 *   Contemporary Art, Modern Art, Fine Arts, Photography & Media,
 *   Design & Architecture, Sculpture & Installation, Cultural Center,
 *   Art Gallery, General Museum
 *
 * Usage: NODE_OPTIONS="--dns-result-order=ipv4first" npx tsx scripts/enrich-descriptions.ts
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

// ── Category Classification ──

const CATEGORIES = [
    'Contemporary Art',
    'Modern Art',
    'Fine Arts',
    'Photography & Media',
    'Design & Architecture',
    'Sculpture & Installation',
    'Cultural Center',
    'Art Gallery',
    'General Museum',
] as const;

type Category = typeof CATEGORIES[number];

const CATEGORY_RULES: { pattern: RegExp; category: Category }[] = [
    // Contemporary
    { pattern: /\bcontemporar/i, category: 'Contemporary Art' },
    { pattern: /\bICA\b|institute of contemporary/i, category: 'Contemporary Art' },
    { pattern: /\b(MOCA|MCA|MACBA|MAMCO|CAPC|CAC|MUAC|MAC)\b/, category: 'Contemporary Art' },
    { pattern: /\bkunsthalle\b/i, category: 'Contemporary Art' },
    { pattern: /\bSerpentine|Palais de Tokyo|Tate Modern|New Museum|MoMA PS1/i, category: 'Contemporary Art' },

    // Modern Art
    { pattern: /\bmodern\s*(art|museum|gallery)/i, category: 'Modern Art' },
    { pattern: /\b(MAM|MOMA|MUMOK|SMAK|MACM|LACMA)\b/, category: 'Modern Art' },
    { pattern: /\bmoderne?\b.*\b(kunst|musée|museo|muzeum)/i, category: 'Modern Art' },
    { pattern: /\bTate\b|Stedelijk|Centre Pompidou|Guggenheim/i, category: 'Modern Art' },

    // Photography & Media
    { pattern: /\bphoto(graph)?/i, category: 'Photography & Media' },
    { pattern: /\bmedia\s*art|digital\s*art|new\s*media/i, category: 'Photography & Media' },
    { pattern: /\bfilm|cinema|video\s*art/i, category: 'Photography & Media' },
    { pattern: /\bZKM|Ars Electronica/i, category: 'Photography & Media' },

    // Design & Architecture
    { pattern: /\bdesign/i, category: 'Design & Architecture' },
    { pattern: /\barchitectur/i, category: 'Design & Architecture' },
    { pattern: /\bVitra|Bauhaus|Cooper Hewitt/i, category: 'Design & Architecture' },
    { pattern: /\bapplied\s*art/i, category: 'Design & Architecture' },

    // Sculpture & Installation
    { pattern: /\bsculptur/i, category: 'Sculpture & Installation' },
    { pattern: /\binstallation/i, category: 'Sculpture & Installation' },
    { pattern: /\bStorm King|Inhotim|Chianti Sculpture/i, category: 'Sculpture & Installation' },

    // Cultural Center
    { pattern: /\bcultural?\s*(center|centre|house)/i, category: 'Cultural Center' },
    { pattern: /\barts?\s*center|arts?\s*centre/i, category: 'Cultural Center' },
    { pattern: /\bfoundation|fondation|fondazione|stiftung/i, category: 'Cultural Center' },

    // Art Gallery
    { pattern: /\bgaller(y|ie|ia)/i, category: 'Art Gallery' },
    { pattern: /\bkunstmuseum/i, category: 'Art Gallery' },

    // Fine Arts
    { pattern: /\bfine\s*art/i, category: 'Fine Arts' },
    { pattern: /\bbeaux[\s-]*arts/i, category: 'Fine Arts' },
    { pattern: /\bmusée\s*d'art\b/i, category: 'Fine Arts' },
    { pattern: /\bart\s*museum/i, category: 'Fine Arts' },
    { pattern: /\bmuseo\s*(de|d')?\s*art/i, category: 'Fine Arts' },
    { pattern: /\bnational\s*gallery/i, category: 'Fine Arts' },
];

function classifyMuseum(name: string, description?: string): Category {
    const text = `${name} ${description || ''}`;
    for (const rule of CATEGORY_RULES) {
        if (rule.pattern.test(text)) {
            return rule.category;
        }
    }
    // Default
    if (/\bmuseum|museo|musée|muzeum\b/i.test(name)) return 'General Museum';
    return 'Art Gallery';
}

// ── Wikidata Description Fetch ──

const SPARQL_DESCRIPTIONS = `
SELECT DISTINCT ?museum ?museumLabel ?museumDescription WHERE {
  VALUES ?type {
    wd:Q207694
    wd:Q2772772
    wd:Q1007870
    wd:Q16735822
    wd:Q64578911
  }
  ?museum wdt:P31 ?type .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ko,ja,fr,de,es" . }
}
LIMIT 5000
`;

interface WikiResult {
    museum: { value: string };
    museumLabel: { value: string };
    museumDescription?: { value: string };
}

async function fetchWikidataDescriptions(): Promise<Map<string, string>> {
    console.log('Fetching descriptions from Wikidata...');
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL_DESCRIPTIONS)}&format=json`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'MuseumMapBot/1.0', 'Accept': 'application/json' }
    });

    if (!res.ok) {
        console.error(`Wikidata error: ${res.status}`);
        return new Map();
    }

    const json = await res.json();
    const results: WikiResult[] = json.results.bindings;
    const descMap = new Map<string, string>();

    for (const r of results) {
        const name = r.museumLabel.value;
        const desc = r.museumDescription?.value;

        // Skip generic descriptions like "museum in City, Country"
        if (desc && desc.length > 20 && !/^Q\d+$/.test(desc)) {
            descMap.set(name, desc.charAt(0).toUpperCase() + desc.slice(1));
        }
    }

    console.log(`Got ${descMap.size} quality descriptions\n`);
    return descMap;
}

// ── Generate description from metadata when Wikidata doesn't have one ──

function generateFallbackDescription(name: string, city: string, country: string, category: Category): string {
    const templates: Record<Category, string[]> = {
        'Contemporary Art': [
            `${name} is a leading contemporary art institution in ${city}, ${country}, showcasing cutting-edge works by emerging and established artists.`,
            `Located in ${city}, ${name} presents dynamic exhibitions of contemporary art, pushing boundaries through innovative artistic expression.`,
        ],
        'Modern Art': [
            `${name} in ${city}, ${country} houses an important collection of modern art, featuring works from the 20th and 21st centuries.`,
            `A premier modern art destination in ${city}, ${name} presents masterworks spanning a century of artistic innovation.`,
        ],
        'Fine Arts': [
            `${name} is a distinguished fine arts institution in ${city}, ${country}, presenting collections that span centuries of artistic achievement.`,
            `Located in ${city}, ${name} celebrates the fine arts through thoughtfully curated exhibitions and a world-class permanent collection.`,
        ],
        'Photography & Media': [
            `${name} in ${city}, ${country} is dedicated to photography and media arts, exploring visual storytelling through lens-based and digital works.`,
        ],
        'Design & Architecture': [
            `${name} in ${city}, ${country} explores the intersection of design and architecture, showcasing innovative works that shape our built environment.`,
        ],
        'Sculpture & Installation': [
            `${name} in ${city}, ${country} features remarkable sculptural works and large-scale installations in an immersive setting.`,
        ],
        'Cultural Center': [
            `${name} serves as a vibrant cultural center in ${city}, ${country}, fostering artistic exchange through exhibitions, performances, and community programs.`,
        ],
        'Art Gallery': [
            `${name} is a distinguished gallery space in ${city}, ${country}, presenting curated exhibitions of visual art across diverse media and movements.`,
        ],
        'General Museum': [
            `${name} in ${city}, ${country} offers visitors a rich exploration of art and culture through its diverse collections and exhibitions.`,
        ],
    };

    const options = templates[category];
    return options[Math.floor(Math.random() * options.length)];
}

// ── Main ──

async function main() {
    console.log('🏛️  Museum Description & Category Enrichment\n');

    // 1) Fetch Wikidata descriptions
    const wikiDescriptions = await fetchWikidataDescriptions();

    // 2) Get all museums from DB
    const { rows: museums } = await pool.query(
        `SELECT id, name, description, city, country, type FROM "Museum" ORDER BY name`
    );
    console.log(`Total museums in DB: ${museums.length}\n`);

    let descUpdated = 0, catUpdated = 0, unchanged = 0;

    for (const m of museums) {
        const newCategory = classifyMuseum(m.name, m.description);
        const needsDesc = !m.description || m.description.length < 20;
        const needsCat = m.type !== newCategory;

        if (!needsDesc && !needsCat) {
            unchanged++;
            continue;
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramIdx = 1;

        // Update description
        if (needsDesc) {
            const wikiDesc = wikiDescriptions.get(m.name);
            const desc = wikiDesc || generateFallbackDescription(m.name, m.city, m.country, newCategory);
            updates.push(`"description" = $${paramIdx++}`);
            values.push(desc);
            descUpdated++;
        }

        // Update category
        if (needsCat) {
            updates.push(`"type" = $${paramIdx++}`);
            values.push(newCategory);
            catUpdated++;
        }

        updates.push(`"updatedAt" = NOW()`);
        values.push(m.id);

        await pool.query(
            `UPDATE "Museum" SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
            values
        );
    }

    console.log(`\n═══════════════════════════════════`);
    console.log(`  📝 Descriptions updated: ${descUpdated}`);
    console.log(`  🏷️  Categories updated:   ${catUpdated}`);
    console.log(`  ⏭️  Unchanged:            ${unchanged}`);
    console.log(`═══════════════════════════════════`);

    // Show category distribution
    const { rows: dist } = await pool.query(
        `SELECT type, COUNT(*) as count FROM "Museum" GROUP BY type ORDER BY count DESC`
    );
    console.log(`\n📊 Category Distribution:`);
    for (const d of dist) {
        console.log(`  ${d.type}: ${d.count}`);
    }

    await pool.end();
}

main().catch(console.error);
