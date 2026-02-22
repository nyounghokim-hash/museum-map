import { NextResponse } from 'next/server';

// Get Reviews from Google Places API
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const city = searchParams.get('city');

        if (!name) {
            return NextResponse.json({ error: 'Museum name required' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing GOOGLE_PLACES_API_KEY' }, { status: 500 });
        }

        // 1. Text Search to get Place ID
        const query = encodeURIComponent(`${name} ${city || ''} museum`);
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.results || searchData.results.length === 0) {
            return NextResponse.json({ data: null });
        }

        const placeId = searchData.results[0].place_id;

        // 2. Place Details to get Reviews and Rating
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        if (!detailsData.result) {
            return NextResponse.json({ data: null });
        }

        return NextResponse.json({
            data: {
                rating: detailsData.result.rating,
                totalRatings: detailsData.result.user_ratings_total,
                reviews: detailsData.result.reviews?.slice(0, 3) || []
            }
        });

    } catch (error: any) {
        console.error('Google Reviews Error:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
