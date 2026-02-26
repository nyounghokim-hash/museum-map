import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        if ((user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get AI usage logs from AuditLog table (actions containing 'ai' or 'recommend' or 'translate')
        const logs = await (prisma as any).auditLog.findMany({
            where: {
                OR: [
                    { action: { contains: 'recommend', mode: 'insensitive' } },
                    { action: { contains: 'translate', mode: 'insensitive' } },
                    { action: { contains: 'ai', mode: 'insensitive' } },
                    { action: { contains: 'gemini', mode: 'insensitive' } },
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const todayLogs = logs.filter((l: any) => new Date(l.createdAt) >= today);
        const weekLogs = logs.filter((l: any) => new Date(l.createdAt) >= weekAgo);
        const monthLogs = logs.filter((l: any) => new Date(l.createdAt) >= monthAgo);

        // Estimate tokens (rough: 100 tokens per request for recommend, 50 for translate)
        const estimateTokens = (actionLogs: any[]) => {
            return actionLogs.reduce((sum: number, l: any) => {
                if (l.action?.includes('recommend')) return sum + 150;
                if (l.action?.includes('translate')) return sum + 80;
                return sum + 100;
            }, 0);
        };

        // Daily breakdown for chart (last 7 days)
        const dailyBreakdown = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
            const dayLogs = logs.filter((l: any) => {
                const d = new Date(l.createdAt);
                return d >= date && d < nextDate;
            });
            dailyBreakdown.push({
                date: date.toISOString().split('T')[0],
                requests: dayLogs.length,
                tokens: estimateTokens(dayLogs),
                recommend: dayLogs.filter((l: any) => l.action?.includes('recommend')).length,
                translate: dayLogs.filter((l: any) => l.action?.includes('translate')).length,
            });
        }

        return NextResponse.json({
            data: {
                today: { requests: todayLogs.length, tokens: estimateTokens(todayLogs) },
                week: { requests: weekLogs.length, tokens: estimateTokens(weekLogs) },
                month: { requests: monthLogs.length, tokens: estimateTokens(monthLogs) },
                total: { requests: logs.length, tokens: estimateTokens(logs) },
                dailyBreakdown,
                recentLogs: logs.slice(0, 20).map((l: any) => ({
                    id: l.id,
                    action: l.action,
                    detail: l.detail?.substring(0, 100),
                    createdAt: l.createdAt,
                    userId: l.userId,
                })),
            }
        });
    } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        // If AuditLog table doesn't exist, return empty data
        return NextResponse.json({
            data: {
                today: { requests: 0, tokens: 0 },
                week: { requests: 0, tokens: 0 },
                month: { requests: 0, tokens: 0 },
                total: { requests: 0, tokens: 0 },
                dailyBreakdown: [],
                recentLogs: [],
                note: 'AuditLog table may not exist or no AI logs found'
            }
        });
    }
}
