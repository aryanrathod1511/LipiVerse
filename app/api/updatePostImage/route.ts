// app/api/updatePostImage/route.ts
import { NextResponse } from 'next/server';
import { uploadOnCloudinary } from '@/lib/cloudinary'; // Cloudinary utility
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { postId, image } = await req.json(); // Parse incoming request

    if (!postId || !image) {
      return NextResponse.json({ error: 'Missing postId or image' }, { status: 400 });
    }

    // Ensure postId is an integer
    const parsedPostId = parseInt(postId, 10);

    // Check if the parsing is successful
    if (isNaN(parsedPostId)) {
      return NextResponse.json({ error: 'Invalid postId' }, { status: 400 });
    }

    // Upload the image to Cloudinary
    const imageUrl = await uploadOnCloudinary(image);

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Update the post with the new image URL
    const post = await prisma.post.update({
      where: { id: parsedPostId }, // Use parsedPostId here
      data: { imageUrl },
    });

    return NextResponse.json({ post, imageUrl }); // Return updated post and image URL
  } catch (error) {
    console.error('Error updating post image:', error);
    return NextResponse.json({ error: 'Failed to update post image' }, { status: 500 });
  }
}

