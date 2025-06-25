// This file gets all blogs for the un-authenticated users by upvotes.
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Blog } from "@/types/BlogTypes";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const q = searchParams.get("q")?.toLowerCase() || "";

    try {
        const posts = await prisma.post.findMany({
            where: q
                ? {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
                    ],
                  }
                : undefined,
            orderBy: sortBy === "upvotes"
                ? { upvotes: { _count: "desc" } }  // Sort by the number of upvotes
                : { createdAt: "desc" },  // Default sort by creation date
            include: {
                author: true,  // Include author information
                tags: true,    // Include tags
                _count: {
                    select: {
                        upvotes: true,  // Include the upvote count in the result
                    },
                },
            },
        });

        // Map the results to include the upvote count in the Blog type
        const blogs: Blog[] = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            upvotes: post._count?.upvotes ?? 0,  // Set the upvotes from the _count field
            tags: Array.isArray(post.tags) ? post.tags.map((tag: { name: string }) => tag.name) : [],
            authorName: post.author?.name ? post.author.name.toLowerCase() : 'unknown',
            createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
        }));

        return NextResponse.json(blogs);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error Fetching Posts" }, { status: 500 });
    }
}
