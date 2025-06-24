import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { NextApiRequest } from "next";

const prisma = new PrismaClient();

// Middleware to check if the user is the post's owner.

export async function authorizePostOwner(req: NextApiRequest, postId: number) {

  const session = await getSession({ req });

  if (!session || !session.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const email = session.user.email;

  // Find the post and include the author in the result
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: true,  // Include author info
    },
  });

  if (!post) {
    return new NextResponse("Post Not Found", { status: 404 });
  }

  if (post.author.email !== email) {
    return new NextResponse("You are not allowed to modify this post.", { status: 403 });
  }

  return NextResponse.next();
}