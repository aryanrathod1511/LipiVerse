"use client";

import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Post as PrismaPost } from "@prisma/client";
import { Appbar } from "../components/Appbar";
import MyBlogCard from "../components/MyBlogsCard";
import MyBlogCardSkeleton from "../components/MyBlogCardSkeleton";
import { Button } from "../components/ui/button";

type PostWithStatus = PrismaPost & { status: 'PUBLISHED' | 'DRAFT' };

const MyBlogsPage = () => {
  const [blogs, setBlogs] = useState<PostWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  useEffect(() => {
    const fetchBlogs = async () => {
      const session = await getSession();

      if (!session) {
        setError("Please log in to view your blogs.");
        signIn();
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/my-blogs");
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        const errorMessage = (err as Error).message || "An unknown error occurred.";
        console.error("Error fetching blogs:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return (
    <div>
      <Appbar />
      <h2 className="text-2xl text-center my-5 font-bold mb-6">My Blogs</h2>
      <div className="masonry p-4">
        {Array(6)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="masonry-item">
              <MyBlogCardSkeleton />
            </div>
          ))}
      </div>
    </div>
  );
  
  if (error) return <div>{error}</div>;

  // Filter blogs by status
  const publishedBlogs = blogs.filter((blog) => blog.status === 'PUBLISHED');
  const draftBlogs = blogs.filter((blog) => blog.status === 'DRAFT');

  return (
    <div>
      <Appbar />
      <h2 className="text-2xl text-center my-5 font-bold mb-6">My Blogs</h2>
      <div className="flex justify-center mb-6 space-x-4">
        <Button variant={activeTab === 'PUBLISHED' ? 'default' : 'outline'} onClick={() => setActiveTab('PUBLISHED')}>Published</Button>
        <Button variant={activeTab === 'DRAFT' ? 'default' : 'outline'} onClick={() => setActiveTab('DRAFT')}>Drafts</Button>
      </div>
      {activeTab === 'PUBLISHED' ? (
        publishedBlogs.length === 0 ? (
          <p>No published blogs found.</p>
        ) : (
          <div className="masonry p-4">
            {publishedBlogs.map((blog) => (
              <div key={blog.id} className="masonry-item">
                <MyBlogCard mode="short" blog={blog} />
              </div>
            ))}
          </div>
        )
      ) : (
        draftBlogs.length === 0 ? (
          <p>No drafts found.</p>
        ) : (
          <div className="masonry p-4">
            {draftBlogs.map((blog) => (
              <div key={blog.id} className="masonry-item">
                <MyBlogCard mode="short" blog={blog} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyBlogsPage;
