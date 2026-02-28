import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

function getAnalyticsClient() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) return null;
  try {
    const credentials = JSON.parse(credentialsJson);
    return new BetaAnalyticsDataClient({ credentials });
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json({
        data: null,
        error: 'GA4_PROPERTY_ID not configured'
      });
    }

    const analyticsClient = getAnalyticsClient();
    if (!analyticsClient) {
      return NextResponse.json({
        data: null,
        error: 'GOOGLE_APPLICATION_CREDENTIALS_JSON not configured'
      });
    }

    const [overview, countryReport, pageReport, realtimeReport] = await Promise.all([
      // 30일 전체 개요
      analyticsClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
      // 국가별 분포
      analyticsClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      }),
      // 인기 페이지
      analyticsClient.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      // 실시간 활성 사용자
      analyticsClient.runRealtimeReport({
        property: propertyId,
        metrics: [{ name: 'activeUsers' }],
      }),
    ]);

    const overviewData = overview[0]?.rows?.[0]?.metricValues || [];
    const realtimeUsers = parseInt(realtimeReport[0]?.rows?.[0]?.metricValues?.[0]?.value || '0');

    return NextResponse.json({
      data: {
        overview: {
          activeUsers: parseInt(overviewData[0]?.value || '0'),
          pageViews: parseInt(overviewData[1]?.value || '0'),
          sessions: parseInt(overviewData[2]?.value || '0'),
          bounceRate: parseFloat(overviewData[3]?.value || '0'),
          avgSessionDuration: parseFloat(overviewData[4]?.value || '0'),
          realtimeUsers,
        },
        countryData: (countryReport[0]?.rows || []).map(row => ({
          country: row.dimensionValues?.[0]?.value || 'Unknown',
          users: parseInt(row.metricValues?.[0]?.value || '0'),
        })),
        topPages: (pageReport[0]?.rows || []).map(row => ({
          path: row.dimensionValues?.[0]?.value || '/',
          views: parseInt(row.metricValues?.[0]?.value || '0'),
        })),
      }
    });
  } catch (error) {
    console.error('GA4 Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics', data: null }, { status: 500 });
  }
}
