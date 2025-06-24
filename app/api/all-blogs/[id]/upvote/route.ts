// Route to Upvote a Blog

import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const postId = parseInt(params.id, 10);

    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

        const upvotes = await prisma.upvote.count({
            where: { postId },
        });

        const hasUpvoted = userId
            ? !!(await prisma.upvote.findUnique({
                where: {
                    postId_userId: { postId, userId },
                },
            }))
            : false;

        return NextResponse.json({ voteCount: upvotes, hasUpvoted });

    } catch (error) {
        console.error("Error fetching vote count:", error);
        return NextResponse.json({ message: "Error fetching vote count" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const postId = parseInt(params.id, 10);

    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userId = parseInt(session.user.id, 10);

        // Check if user already upvoted
        const alreadyUpvoted = await prisma.upvote.findUnique({
            where: { postId_userId: { postId, userId } },
        });

        if (alreadyUpvoted) {
            return NextResponse.json({ message: "Already upvoted" }, { status: 400 });
        }

        // Add the upvote
        await prisma.upvote.create({
            data: { postId, userId },
        });

        return NextResponse.json({ message: "Upvote successful" }, { status: 201 });
    } catch (error) {
        console.error("Failed to upvote", error);
        return NextResponse.json({ message: "Failed to upvote" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const postId = parseInt(params.id, 10);

    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const userId = parseInt(session.user.id, 10);

        // Remove the upvote
        await prisma.upvote.delete({
            where: { postId_userId: { postId, userId } },
        });

        return NextResponse.json({ message: "Upvote removed" }, { status: 200 });
    } catch (error) {
        console.error("Failed to remove upvote", error);
        return NextResponse.json({ message: "Failed to remove upvote" }, { status: 500 });
    }
}
