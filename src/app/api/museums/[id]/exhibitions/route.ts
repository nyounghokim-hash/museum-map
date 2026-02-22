import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json({ error: 'Museum name required' }, { status: 400 });
        }

        const apiKey = process.env.SERPER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing SERPER_API_KEY' }, { status: 500 });
        }

        const myHeaders = new Headers();
        myHeaders.append("X-API-KEY", apiKey);
        myHeaders.append("Content-Type", "application/json");

        const q = `current exhibitions at ${name} official`;

        const raw = JSON.stringify({
            "q": q,
            "num": 5
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow' as RequestRedirect
        };

        const response = await fetch("https://google.serper.dev/search", requestOptions);
        const result = await response.json();

        // Extract organic results that look like exhibition pages
        const exhibitions = result.organic?.map((item: any) => ({
            title: item.title.replace(`- ${name}`, '').replace(`| ${name}`, '').trim(),
            link: item.link,
            snippet: item.snippet
        })) || [];

        return NextResponse.json({ data: exhibitions.slice(0, 3) });

    } catch (error: any) {
        console.error('Serper API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch exhibitions' }, { status: 500 });
    }
}
