"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Appbar } from "./components/Appbar";
import { Blog } from "@/types/BlogTypes";
import BlogCard from "./components/BlogCard";
import { BlogCardSkeleton } from "./components/BlogCardSkeleton";
import { Mail, Linkedin, Copyright } from "lucide-react";
import { Button } from "./components/ui/button";

async function fetchAllBlogs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/all-blogs`);
  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }
  return res.json();
}

function getRandomBlogs(blogs: Blog[], count: number) {
  const shuffled = blogs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const currentYear = new Date().getFullYear();

  const handleUpvote = async (blogId: number) => {
    try {
      const response = await fetch(`/api/all-blogs/${blogId}/upvote`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upvote");
      }
    } catch (err) {
      console.error("Failed to upvote", err);
    }
  };

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const blogsData = await fetchAllBlogs();
        const randomBlogs = getRandomBlogs(blogsData, 3);
        setBlogs(randomBlogs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Appbar />
      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to LipiVerse
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Exploring ideas, one post at a time. Dive into our world of
                thoughtful content and engaging stories.
              </p>
            </div>
            <div className="space-x-4">
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                href="/all-blogs"
              >
                Read Latest Blogs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-8 text-center">
            Featured Blogs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }, (_, i) => (
                  <BlogCardSkeleton key={i} />
                ))
              : blogs.map((blog) => (
                  <div key={blog.id} className="break-inside-avoid-column">
                    <BlogCard
                      blog={blog}
                      mode="short"
                      onUpvote={handleUpvote}
                    />
                  </div>
                ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About LipiVerse</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                LipiVerse is a platform for sharing insightful articles and stories.
                We aim to provide thoughtful content and engaging narratives on
                a wide range of topics.
              </p>
            </div>
          </div>
          <div className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Link
                href="mailto:aryanrathod1515@gmail.com"
                aria-label="Email Aryan Rathod"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email
                </Button>
              </Link>
              <Link
                href="https://www.linkedin.com/in/aryan-rathod-2447a427a/"
                aria-label="Aryan Rathod's LinkedIn"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  LinkedIn
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Copyright className="h-4 w-4 mr-1" />
              {currentYear} LipiVerse by Aryan Rathod. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
