import { NextRequest, NextResponse } from 'next/server';

// OpenAI API docs: https://platform.openai.com/docs/api-reference/chat/create
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { blogContent } = await req.json();
    if (!blogContent || blogContent.length < 20) {
      return NextResponse.json({ tags: [] }, { status: 200 });
    }
    const prompt = `Suggest 5 relevant, single-word tags for the following blog post. Only return the tags, separated by commas.\n\nBlog Content: ${blogContent}`;
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
        max_tokens: 50,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.choices || !data.choices[0]?.message?.content) {
      return NextResponse.json({ tags: [] }, { status: 200 });
    }
    const tags = data.choices[0].message.content
      .split(',')
      .map((t: string) => t.trim().replace(/^#/, ''))
      .filter((t: string) => t.length > 0)
      .slice(0, 5);
    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json({ tags: [] }, { status: 200 });
  }
}
