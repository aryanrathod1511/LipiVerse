// This file gets all blogs for the un-authenticated users by upvotes.
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";

    try {
        const posts = await prisma.post.findMany({
            orderBy: sortBy === "upvotes"
                ? { upvotes: { _count: "desc" } }  // Sort by the number of upvotes
                : { createdAt: "desc" },  // Default sort by creation date
            include: {
                author: true,  // Include author information
                _count: {
                    select: {
                        upvotes: true,  // Include the upvote count in the result
                    },
                },
            },
        });

        // Map the results to include the upvote count in the Blog type
        const blogs = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            upvotes: post._count.upvotes,  // Set the upvotes from the _count field
        }));

        return NextResponse.json(blogs);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error Fetching Posts" }, { status: 500 });
    }
}
