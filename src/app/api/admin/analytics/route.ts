import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { google } = require('googleapis');

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if ((user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const propertyId = process.env.GA4_PROPERTY_ID;
    const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!propertyId || !credentialsJson) {
      return NextResponse.json({
        data: null,
        error: 'GA4_PROPERTY_ID or GOOGLE_SERVICE_ACCOUNT_JSON not set',
        setup: {
          GA4_PROPERTY_ID: !!propertyId,
          GOOGLE_SERVICE_ACCOUNT_JSON: !!credentialsJson,
        }
      });
    }

    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      return NextResponse.json({ error: 'Invalid GOOGLE_SERVICE_ACCOUNT_JSON format' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    const [realtimeRes, last7dRes, last30dRes, pageViewsRes, countriesRes] = await Promise.allSettled([
      analyticsData.properties.runRealtimeReport({
        property: `properties/${propertyId}`,
        requestBody: { metrics: [{ name: 'activeUsers' }] },
      }),
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        },
      }),
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }],
        },
      }),
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        },
      }),
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 10,
        },
      }),
    ]);

    const realtime = realtimeRes.status === 'fulfilled' ? parseInt(realtimeRes.value.data?.rows?.[0]?.metricValues?.[0]?.value || '0') : 0;
    const daily = last7dRes.status === 'fulfilled' ? (last7dRes.value.data?.rows || []).map((r: any) => ({ date: r.dimensionValues[0].value, users: parseInt(r.metricValues[0].value || '0'), sessions: parseInt(r.metricValues[1].value || '0'), pageViews: parseInt(r.metricValues[2].value || '0') })) : [];
    const totals30d = last30dRes.status === 'fulfilled' ? { users: parseInt(last30dRes.value.data?.rows?.[0]?.metricValues?.[0]?.value || '0'), sessions: parseInt(last30dRes.value.data?.rows?.[0]?.metricValues?.[1]?.value || '0'), pageViews: parseInt(last30dRes.value.data?.rows?.[0]?.metricValues?.[2]?.value || '0'), avgSessionDuration: parseFloat(last30dRes.value.data?.rows?.[0]?.metricValues?.[3]?.value || '0'), bounceRate: parseFloat(last30dRes.value.data?.rows?.[0]?.metricValues?.[4]?.value || '0') } : null;
    const topPages = pageViewsRes.status === 'fulfilled' ? (pageViewsRes.value.data?.rows || []).map((r: any) => ({ path: r.dimensionValues[0].value, views: parseInt(r.metricValues[0].value || '0') })) : [];
    const countries = countriesRes.status === 'fulfilled' ? (countriesRes.value.data?.rows || []).map((r: any) => ({ country: r.dimensionValues[0].value, users: parseInt(r.metricValues[0].value || '0') })) : [];

    return NextResponse.json({ data: { realtime, daily, totals30d, topPages, countries } });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    console.error('GA4 API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch analytics', detail: err.code }, { status: 500 });
  }
}
