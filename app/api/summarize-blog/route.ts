import { NextRequest, NextResponse } from 'next/server';

const APYHUB_API_URL = 'https://api.apyhub.com/ai/summarize-text';
const APYHUB_API_KEY = process.env.APYHUB_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || content.length < 20) {
      return NextResponse.json({ error: 'Content too short to summarize.' }, { status: 400 });
    }

    const response = await fetch(APYHUB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(APYHUB_API_KEY ? { 'apy-token': APYHUB_API_KEY } : {}),
      },
      body: JSON.stringify({ text: content }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Failed to summarize: ' + error }, { status: 500 });
    }

    const data = await response.json();
    const summary = data.data?.summary || 'No summary available.';
    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 