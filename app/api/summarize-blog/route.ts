import { NextRequest, NextResponse } from 'next/server';

const APYHUB_API_URL = 'https://api.apyhub.com/ai/summarize-text';
const APYHUB_API_KEY = process.env.APYHUB_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || content.length < 20) {
      return NextResponse.json({ summary: '' }, { status: 200 });
    }
    // ApyHub expects a POST with { text: ... }
    const response = await fetch(APYHUB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apy-token': APYHUB_API_KEY || '',
      },
      body: JSON.stringify({ text: content, summary_length: 'medium', output_language: 'en' }),
    });
    const data = await response.json();
    if (!response.ok || !data.data || !data.data.summary) {
      return NextResponse.json({ summary: '' }, { status: 200 });
    }
    // ApyHub returns the summary in data.data.summary
    const summary = data.data.summary.trim();
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing blog', error);
    return NextResponse.json({ summary: '' }, { status: 200 });
  }
}
