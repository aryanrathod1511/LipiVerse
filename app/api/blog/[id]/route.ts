import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { uploadOnCloudinary } from "@/lib/cloudinary";

const prisma = new PrismaClient();

// GET: Fetches individual blog details based on the ID.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    const blog = await prisma.post.findUnique({
      where: { id: id },
    });

    // If blog is not found, return a 404 error
    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal Server Error for Get request" }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Ensure proper disconnection
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || !session.user.id) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const id = parseInt(params.id, 10);
      const { title, content, image } = await req.json();

      if (!title || !content) {
          return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
      }

      // Initialize image URL
      let imageUrl: string | null = null;

      // If an image is provided, upload it to Cloudinary
      if (image) {
          try {
              imageUrl = await uploadOnCloudinary(image);
              if (!imageUrl) {
                  throw new Error("Image upload failed");
              }
          } catch (uploadError) {
              console.error("Image upload error:", uploadError);
              return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
          }
      }

      // Define a type for the updateData object
      const updateData: { title: string, content: string, imageUrl?: string | null } = {
          title,
          content,
      };

      if (imageUrl) {
          updateData.imageUrl = imageUrl;
      }

      const updatedBlog = await prisma.post.update({
          where: {
              id: id,
          },
          data: updateData,
      });

      return NextResponse.json(updatedBlog);
  } catch (error) {
      console.error("PUT error:", error);
      return NextResponse.json({ message: "Internal Server Error for Post" }, { status: 500 });
  } finally {
      await prisma.$disconnect();
  }
}


// DELETE: Deletes a blog post.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user || !session.user.id) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const id = parseInt(params.id, 10);

      if (isNaN(id)) {
          return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
      }

      // Deleting the blog post
      await prisma.post.delete({
          where: {
              id: id,
          },
      });

      return NextResponse.json({ message: "The post has been deleted successfully." }, { status: 200 });
  } catch (error) {
      console.error("DELETE Error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
