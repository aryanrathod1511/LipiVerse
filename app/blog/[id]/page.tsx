// BlogPage.tsx - Server component
import { PrismaClient } from "@prisma/client";
import BlogCard from "@/app/components/BlogCard";
import { Blog } from "@/types/BlogTypes";
import { Appbar } from "@/app/components/Appbar";

const prisma = new PrismaClient();

async function getBlog(id: string) {
  const blog = await prisma.post.findUnique({
    where: { id: parseInt(id, 10) },
  });

  return blog;
}

export default async function BlogPage({ params }: { params: { id: string } }) {
  const blog = await getBlog(params.id);

  if (!blog) {
    return <h1>Blog not found</h1>;
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Appbar isBlogPage={true}/>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Only pass data, not handlers, to BlogCard */}
        <BlogCard blog={blog as Blog} mode="full" />
      </main>
    </div>
  );
}
