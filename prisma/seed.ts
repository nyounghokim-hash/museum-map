import { PrismaClient } from '@prisma/client'
import { GLOBAL_MUSEUMS } from './seed-data'

const prisma = new PrismaClient()

async function main() {
    console.log(`Seeding ${GLOBAL_MUSEUMS.length} museums...`)

    let inserted = 0;
    let skipped = 0;

    for (const m of GLOBAL_MUSEUMS) {
        const id = Math.random().toString(36).substring(2, 10);

        // Check if it exists for idempotency (by name)
        const exists = await prisma.museum.findFirst({
            where: { name: m.name }
        })

        if (!exists) {
            await prisma.$executeRaw`
        INSERT INTO "Museum" (
          "id", "name", "description", "country", "city", "type", "website",
          "latitude", "longitude", "location",
          "updatedAt"
        )
        VALUES (
          ${id}, ${m.name}, ${null}, ${m.country}, ${m.city}, ${m.ownership},
          ${m.website},
          ${m.lat}, ${m.lng},
          ST_SetSRID(ST_Point(${m.lng}, ${m.lat}), 4326),
          NOW()
        )
      `
            inserted++;
        } else {
            skipped++;
        }
    }

    console.log(`Seed completed: ${inserted} inserted, ${skipped} already existed.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
