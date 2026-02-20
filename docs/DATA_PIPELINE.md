# Data Pipeline Strategy: Global Contemporary & Modern Museums

## 1. Overview
The goal of this data pipeline is to scalably discover, collect, and update contemporary and modern art museums worldwide. Instead of relying on manual entry, the system aggregates public knowledge graphs (Wikidata, OSM) and progressively enriches the data via specialized crawlers.

## 2. Data Sources
1. **Wikidata (Primary Meta & Coordinates)**: 
   - Uses SPARQL queries to fetch instances of *Contemporary Art Museum* (Q19812695), *Modern Art Museum* (Q113426514), and *Art Center* (Q17502781).
   - Extracts Labels, Descriptions, Official Website URLs (P856), and Coordinates (P625).
2. **OpenStreetMap / OSM (Auxiliary)**:
   - Used to verify physical addresses and catch newly constructed buildings.
3. **Official Websites (Enrichment - TODO)**:
   - Targeted crawling of URLs extracted from Wikidata to parse `Operating Hours` and `Current Exhibitions`.

## 3. Filtering & Classification Rules
- **Coordinate Requirement**: Any museum missing geolocation data (latitude/longitude) is immediately filtered out or placed in a "Pending" queue since the map-based MVP heavily relies on PostGIS.
- **Categorization**:
  - `CONTEMPORARY`: Maps to Wikidata Q19812695.
  - `MODERN`: Maps to Wikidata Q113426514.
  - `ART_CENTER`: Maps to Wikidata Q17502781.
  - `MIXED`: If tags overlap or label contains both "Modern and Contemporary".

## 4. Cron Job & Scheduling Structure

To optimize server costs and respect source rate limits, updates are tiered:

### Level 1: Base Metadata (Monthly)
- **Script**: `npm run pipeline:wikidata` (e.g., `scripts/import_wikidata_museums.ts`)
- **Action**: Queries Wikidata for new nodes or updated meta-information (name changes, domain changes).
- **Frequency**: Once per month (e.g., `0 0 1 * *`)

### Level 2: Operating Hours & Status (Weekly)
- **Script**: `npm run pipeline:hours`
- **Action**: Scrapes the registered official website (or Google Places API if integrated later) to update opening hours or handle holiday closures.
- **Frequency**: Once per week (e.g., `0 2 * * 1`)

### Level 3: Exhibitions & Events (Daily)
- **Script**: `npm run pipeline:exhibitions`
- **Action**: High-frequency crawler targeting specific top-tier museums to parse current and upcoming exhibitions.
- **Frequency**: Daily at midnight (e.g., `0 3 * * *`)
