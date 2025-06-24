import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Fetch all bookmarks for a user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.id !== params.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt(session.user.id, 10);

        const bookmarks = await prisma.bookmark.findMany({
            where: { userId },
            include: { post: true }, // Include post data
        });

        const bookmarkData = bookmarks.map((bookmark) => ({
            ...bookmark.post, // Spread post details into the response
            hasBookmarked: true,
        }));

        return NextResponse.json(bookmarkData, { status: 200 });
    } catch (error) {
        console.error("Error fetching bookmarks", error);
        return NextResponse.json({ message: "Error fetching bookmarks" }, { status: 500 });
    }
}

