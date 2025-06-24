import { NextRequest, NextResponse } from 'next/server';

// Lexica.art is a free API for searching AI-generated images
// Docs: https://lexica.art/docs/api
const LEXICA_API_URL = 'https://lexica.art/api/v1/search';

export async function POST(req: NextRequest) {
    try {
        const { title } = await req.json();
        if (!title || title.length < 3) {
            return NextResponse.json({ imageUrl: '' }, { status: 200 });
        }
        // Use the blog title as the search query
        const query = encodeURIComponent(title);
        const response = await fetch(`${LEXICA_API_URL}?q=${query}`);
        const data = await response.json();
        // Lexica returns an array of images, pick the first one
        const imageUrl = data.images?.[0]?.srcSmall || '';
        return NextResponse.json({ imageUrl });
    } catch (error) {
        return NextResponse.json({ imageUrl: '' }, { status: 200 });
    }
}
