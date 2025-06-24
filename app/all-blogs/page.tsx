"use client";

import useSWR from "swr";
import BlogCard from "../components/BlogCard";
import { Appbar } from "../components/Appbar";
import { BlogCardSkeleton } from "../components/BlogCardSkeleton";
import { Blog } from "@/types/BlogTypes";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AllBlogs() {
    const [search, setSearch] = useState("");
    const { data: blogs, mutate, error, isLoading } = useSWR<Blog[]>(`/api/all-blogs${search ? `?q=${encodeURIComponent(search)}` : ""}`, fetcher);

    const handleUpvote = async (blogId: number) => {
        try {
            const response = await fetch(`/api/all-blogs/${blogId}/upvote`, {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upvote');
            }
            mutate(); // Re-fetch blogs to update the UI with the new upvote
        } catch (err) {
            console.error("Failed to upvote", err);
        }
    };

    if (error) return <div>Failed to load blogs: {error.message}</div>;

    return (
        <div>
            <Appbar isBlogPage={true} />
            <div className="max-w-2xl mx-auto px-4 py-6">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search blogs by title or tags..."
                    className="w-full px-4 py-2 border rounded mb-6"
                />
            </div>
            {/* Masonry Layout */}
            <div className="masonry p-4">
                {isLoading || !blogs
                    ? Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="masonry-item">
                            <BlogCardSkeleton />
                        </div>
                    ))
                    : blogs.map((blog) => (
                        <div key={blog.id} className="masonry-item">
                            <BlogCard mode="short" blog={blog} onUpvote={handleUpvote} />
                        </div>
                    ))}
            </div>
        </div>
    );
}
