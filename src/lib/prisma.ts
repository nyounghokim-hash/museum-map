import { PrismaClient } from '../generated_v2/client'

// Force a new client instance from the locally generated client
const prisma = new PrismaClient()

export { prisma }
