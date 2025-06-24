import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || content.length < 20) {
      return NextResponse.json({ summary: '' }, { status: 200 });
    }
    const prompt = `Summarize the following blog post in 3-4 concise sentences, focusing on the main ideas and key takeaways.\n\nBlog Content: ${content}`;
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for blog readers.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.5,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.choices || !data.choices[0]?.message?.content) {
      return NextResponse.json({ summary: '' }, { status: 200 });
    }
    const summary = data.choices[0].message.content.trim();
    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ summary: '' }, { status: 200 });
  }
} 