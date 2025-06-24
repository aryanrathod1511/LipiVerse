"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Appbar } from "../components/Appbar";
import BlogCard from "../components/BlogCard";
import { Blog } from "@/types/BlogTypes";

const BookmarksPage = () => {
    const { data: session, status } = useSession();
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn();
        }

        const fetchBookmarks = async () => {
            if (!session?.user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch the bookmarks
                const response = await fetch(`/api/bookmark/${session.user.id}/getBookmarks`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch bookmarks. Status: ${response.status}`);
                }

                const data = await response.json();
                setBookmarkedPosts(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchBookmarks();
        }
    }, [session, status]);

    if (loading) {
        return (
            <div>
                <Appbar />
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Loading your bookmarks...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Appbar />
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Error: {error}</h1>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Appbar />
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-8 text-center">
                        Your Bookmarked Posts
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarkedPosts.length === 0 ? (
                            <p>No bookmarks found.</p>
                        ) : (
                            bookmarkedPosts.map((blog) => (
                                <div key={blog.id} className="break-inside-avoid-column">
                                    <BlogCard blog={blog} mode="short" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BookmarksPage;
