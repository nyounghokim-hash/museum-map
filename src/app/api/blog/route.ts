import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';
import fs from 'fs';
import path from 'path';
import { translateText } from '@/lib/translate';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeDrafts = searchParams.get('includeDrafts') === 'true';

        const posts = await (prisma as any).story.findMany({
            where: {
                status: includeDrafts ? { not: 'DELETED' } : 'PUBLISHED'
            },
            orderBy: { createdAt: 'desc' },
            include: {
                museums: {
                    include: {
                        museum: { select: { id: true, name: true, city: true, country: true, imageUrl: true } }
                    }
                }
            }
        });

        return successResponse(posts);
    } catch (err: any) {
        console.error('Fetch blog error:', err);
        return errorResponse('INTERNAL_SERVER_ERROR', 'Failed to fetch blog posts', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log('Blog POST request received');
        const user = await requireAuth();
        console.log('User authenticated:', user.id);

        const body = await req.json();
        const { title, content, description, author, previewImage, status, museumIds } = body;
        console.log('Request body:', { title, author, status, museumIds });

        if (!title || !content) {
            return errorResponse('BAD_REQUEST', 'Title and content are required', 400);
        }

        // Automatic Translation
        const titleEn = await translateText(title, 'en');
        const contentEn = await translateText(content, 'en');

        // Try to create the story with museum connections
        const post = await (prisma as any).story.create({
            data: {
                title,
                titleEn,
                content,
                contentEn,
                description: description || null,
                author: author || user.name || 'Anonymous',
                previewImage,
                status: status || 'DRAFT',
                ...(museumIds && museumIds.length > 0 ? {
                    museums: {
                        create: museumIds.map((mid: string) => ({ museumId: mid }))
                    }
                } : {})
            },
            include: {
                museums: {
                    include: { museum: { select: { id: true, name: true, city: true, country: true } } }
                }
            }
        });

        console.log('Story created successfully:', post.id);
        return successResponse(post, 201);
    } catch (err: any) {
        const errorDetail = `[${new Date().toISOString()}] Create blog error: ${err.message}\nStack: ${err.stack}\n`;
        fs.appendFileSync(path.join(process.cwd(), 'blog_error.log'), errorDetail);

        console.error('Create blog error details:', err);
        if (err.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', 'Auth required', 401);

        // Provide more detail in the response for debugging
        return errorResponse('INTERNAL_SERVER_ERROR', `Failed to create blog post: ${err.message || 'Unknown error'}`, 500);
    }
}
