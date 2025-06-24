import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// POST - Add a bookmark for a specific blog post
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const blogId = parseInt(params.id, 10);

    try {
        const session = await getServerSession(authOptions);

        // Check if the user is logged in
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);

        // Check if the user has already bookmarked this blog
        const existingBookmark = await prisma.bookmark.findUnique({
            where: { postId_userId: { postId: blogId, userId } },
        });

        if (existingBookmark) {
            return NextResponse.json({ message: "Already bookmarked" }, { status: 400 });
        }

        // Create a new bookmark
        await prisma.bookmark.create({
            data: { postId: blogId, userId },
        });

        return NextResponse.json({ message: "Bookmark successful" }, { status: 201 });
    } catch (error) {
        console.error("Failed to bookmark", error);
        return NextResponse.json({ message: "Failed to bookmark" }, { status: 500 });
    }
}

// DELETE - Remove a bookmark for a specific blog post
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const blogId = parseInt(params.id, 10);

    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);

        // Remove the bookmark
        await prisma.bookmark.delete({
            where: { postId_userId: { postId: blogId, userId } },
        });

        return NextResponse.json({ message: "Bookmark removed" }, { status: 200 });
    } catch (error) {
        console.error("Failed to remove bookmark", error);
        return NextResponse.json({ message: "Failed to remove bookmark" }, { status: 500 });
    }
}

// GET - Fetch bookmark status for a specific blog post
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const blogId = parseInt(params.id, 10);

    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

        if (!userId) {
            return NextResponse.json({ hasBookmarked: false }, { status: 200 });
        }

        const hasBookmarked = await prisma.bookmark.findUnique({
            where: { postId_userId: { postId: blogId, userId } },
        });

        return NextResponse.json({ hasBookmarked: !!hasBookmarked }, { status: 200 });
    } catch (error) {
        console.error("Error fetching bookmark status", error);
        return NextResponse.json({ message: "Error fetching bookmark status" }, { status: 500 });
    }
}
