import { PrismaClient, PostStatus } from "@prisma/client";
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
      include: { tags: true },
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
      const { title, content, image, imageUrl, status, tags } = await req.json();

      if (!title || !content) {
          return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
      }

      let imageUrlToSave: string | null = null;
      if (imageUrl) {
          imageUrlToSave = imageUrl;
      } else if (image) {
          try {
              imageUrlToSave = await uploadOnCloudinary(image);
              if (!imageUrlToSave) {
                  throw new Error("Image upload failed");
              }
          } catch (uploadError) {
              console.error("Image upload error:", uploadError);
              return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
          }
      }

      const updateData: { title: string, content: string, imageUrl?: string | null, status?: PostStatus } = {
          title,
          content,
      };
      if (imageUrlToSave) {
          updateData.imageUrl = imageUrlToSave;
      }
      if (status && (status === 'DRAFT' || status === 'PUBLISHED')) {
          updateData.status = status as PostStatus;
      }

      // Handle tags update
      let tagConnect = undefined;
      if (Array.isArray(tags)) {
          // Get all previous tags for this post
          const prevPost = await prisma.post.findUnique({
              where: { id },
              include: { tags: true },
          });
          const prevTags = prevPost?.tags?.map(t => t.name) || [];
          // Union of previous and new tags
          const allTags = Array.from(new Set([...prevTags, ...tags]));
          tagConnect = await Promise.all(allTags.map(async (tag: string) => {
              const existing = await prisma.tag.findUnique({ where: { name: tag } });
              if (existing) return { id: existing.id };
              const created = await prisma.tag.create({ data: { name: tag } });
              return { id: created.id };
          }));
      }

      const updatedBlog = await prisma.post.update({
          where: {
              id: id,
          },
          data: {
              ...updateData,
              ...(tagConnect ? { tags: { set: tagConnect } } : {}),
          },
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

      // Check ownership before deleting
      const blog = await prisma.post.findUnique({ where: { id } });
      if (!blog) {
        return NextResponse.json({ message: "Blog not found" }, { status: 404 });
      }
      if (blog.authorId !== parseInt(session.user.id, 10)) {
        return NextResponse.json({ message: "You are not authorized to delete this blog." }, { status: 403 });
      }
      // Deleting the blog post
      await prisma.post.delete({
        where: { id },
      });

      return NextResponse.json({ message: "The post has been deleted successfully." }, { status: 200 });
  } catch (error) {
      console.error("DELETE Error:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
