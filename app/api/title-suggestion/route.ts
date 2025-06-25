import { NextRequest, NextResponse } from 'next/server';

// OpenAI API docs: https://platform.openai.com/docs/api-reference/chat/create
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { partialTitle } = await req.json();
    if (!partialTitle || partialTitle.length < 5) {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }
    const prompt = `Suggest 3 catchy, creative, and engaging blog post titles based on this topic: "${partialTitle}". Each suggestion should be unique, attention-grabbing, and suitable for a professional blog. Separate each suggestion with a newline.`;
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for blog writers.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.choices || !data.choices[0]?.message?.content) {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }
    const suggestions = data.choices[0].message.content
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 3);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
