import { PrismaClient } from '../../../generated_v2/client';
import { NextResponse } from 'next/server';

export async function GET() {
    const prisma = new PrismaClient();
    const keys = Object.keys(prisma);
    const storyExists = 'story' in prisma;
    const modelNames = (prisma as any)._dmmf?.modelMap ? Object.keys((prisma as any)._dmmf.modelMap) : 'DMMF not found';

    return NextResponse.json({
        keys,
        storyExists,
        modelNames,
        clientVersion: (prisma as any)._clientVersion,
        v2: true
    });
}
