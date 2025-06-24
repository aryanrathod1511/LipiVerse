import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth'; 
import { PrismaClient } from '@prisma/client';
import { uploadOnCloudinary } from '@/lib/cloudinary';

const prisma = new PrismaClient();

// POST for creating new blogs.
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    if (isNaN(userId)) {
        return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const { title, content, image } = await req.json();

    if (!title || !content) {
        return NextResponse.json({ message: "Title and content are required" }, { status: 400 });
    }

    let imageUrl = null;

    // If image is provided, upload to Cloudinary
    if (image) {
        try {
            imageUrl = await uploadOnCloudinary(image);
            if (!imageUrl) {
                return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
            }
        } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            return NextResponse.json({ message: "Error uploading image" }, { status: 500 });
        }
    }

    try {
        // Create the new post
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: userId,
                imageUrl, // Include the imageUrl, will be null if not provided
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
