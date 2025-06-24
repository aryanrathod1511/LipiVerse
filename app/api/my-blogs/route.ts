import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth'; 
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server'; 

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET for author’s blogs: Fetches all blogs authored by the logged-in user.
export async function GET(req: NextRequest) { 
    try {
        const session = await getServerSession({ req, ...authOptions });

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const authorId = parseInt(session.user.id, 10);

        const blogs = await prisma.post.findMany({
            where: {
                authorId: authorId,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
