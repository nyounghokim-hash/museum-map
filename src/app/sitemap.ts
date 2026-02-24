import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://global-museums.vercel.app';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/collections`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/feedback`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic blog posts
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        const posts = await (prisma as any).story.findMany({
            where: { status: 'PUBLISHED' },
            select: { id: true, updatedAt: true },
        });
        blogPages = posts.map((post: any) => ({
            url: `${baseUrl}/blog/${post.id}`,
            lastModified: post.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (e) {
        console.error('Sitemap: failed to fetch blog posts', e);
    }

    // Dynamic museum pages
    let museumPages: MetadataRoute.Sitemap = [];
    try {
        const museums = await prisma.museum.findMany({
            select: { id: true, updatedAt: true },
            take: 500,
        });
        museumPages = museums.map((museum: any) => ({
            url: `${baseUrl}/museums/${museum.id}`,
            lastModified: museum.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));
    } catch (e) {
        console.error('Sitemap: failed to fetch museums', e);
    }

    return [...staticPages, ...blogPages, ...museumPages];
}
