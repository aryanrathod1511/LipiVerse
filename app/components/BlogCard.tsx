"use client";

import React, { useState, useEffect } from "react";
import { BlogCardProps } from "@/types/BlogTypes";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ChevronUp, Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const BlogCard: React.FC<BlogCardProps> = ({ blog, mode }) => {
    const { id, title, content, imageUrl, tags = [], createdAt, authorName } = blog;
    const [voteCount, setVoteCount] = useState(blog.upvotes || 0);
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [hasBookmarked, setHasBookmarked] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const voteResponse = await fetch(`/api/all-blogs/${id}/upvote`);
                if (voteResponse.ok) {
                    const voteData = await voteResponse.json();
                    setVoteCount(voteData.voteCount);
                    setHasUpvoted(voteData.hasUpvoted);
                }

                if (session?.user?.id) {
                    const bookmarkResponse = await fetch(`/api/bookmark/${id}`);
                    if (bookmarkResponse.ok) {
                        const bookmarkData = await bookmarkResponse.json();
                        setHasBookmarked(bookmarkData.hasBookmarked);
                    }
                }
            }catch {
                console.error("Failed to fetch vote count or bookmark status");
            }
        };

        fetchData();
    }, [id, session]);

    const handleUpvote = async () => {
        if (!session) {
            signIn();
            return;
        }

        try {
            const method = hasUpvoted ? "DELETE" : "POST";
            const response = await fetch(`/api/all-blogs/${id}/upvote`, { method });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update upvote");
            }

            setHasUpvoted(!hasUpvoted);
            setVoteCount((prevCount) => (hasUpvoted ? prevCount - 1 : prevCount + 1));
        } catch (err) {
            console.error("Failed to update upvote", err);
        }
    };

    const handleBookmark = async () => {
        if (!session) {
            signIn();
            return;
        }

        try {
            const method = hasBookmarked ? "DELETE" : "POST";
            const response = await fetch(`/api/bookmark/${id}`, { method });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update bookmark");
            }

            setHasBookmarked(!hasBookmarked);
        } catch {
            console.error("Failed to update bookmark");
        }
    };

    const handleSummarize = async () => {
        setIsSummarizing(true);
        setSummaryError(null);
        try {
            const response = await fetch('/api/summarize-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            const data = await response.json();
            if (data.summary) {
                setSummary(data.summary);
            } else {
                setSummaryError(data.error || 'Failed to summarize.');
            }
        } catch (err) {
            setSummaryError('Failed to summarize.');
        } finally {
            setIsSummarizing(false);
        }
    };

    // Utility function to truncate Markdown content for preview
    const truncateMarkdown = (markdown: string, maxLength: number) => {
        if (markdown.length <= maxLength) return markdown;
        return markdown.slice(0, maxLength) + "...";
    };

    return (
        <Card className="card">
            <CardHeader>
                <div className="flex justify-between items-start w-full">
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    <div className="flex flex-col items-end ml-2">
                        {authorName && (
                            <span className="text-xs text-gray-500 font-medium capitalize">
                                by {authorName.split(' ')[0]}
                            </span>
                        )}
                        {createdAt && (
                            <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                                {new Date(createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/:\d\d$/, '')}
                            </span>
                        )}
                    </div>
                </div>
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={title}
                        width={600}
                        height={400}
                        quality={100}
                        priority
                        className="w-full h-auto object-cover mb-4"
                    />
                )}
            </CardHeader>
            <CardContent>
                {/* Tag badges (always visible) */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag: string) => (
                            <span
                                key={tag}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-200"
                                onClick={() => router.push(`/all-blogs?q=${encodeURIComponent(tag)}`)}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
                <ReactMarkdown
                    className="prose prose-sm sm:prose lg:prose-lg"
                    remarkPlugins={[remarkGfm]}
                >
                    {mode === "short" ? truncateMarkdown(content, 50) : content}
                </ReactMarkdown>
                {mode === "full" && (
                    <div className="mt-6">
                        <Button onClick={handleSummarize} disabled={isSummarizing} variant="secondary">
                            {isSummarizing ? "Summarizing..." : "Summarize"}
                        </Button>
                        {summary && (
                            <div className="mt-4 p-4 bg-gray-100 rounded">
                                <h3 className="font-semibold mb-2">Summary</h3>
                                <p>{summary}</p>
                            </div>
                        )}
                        {summaryError && (
                            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                                {summaryError}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="card-footer flex flex-wrap gap-2 lg:gap-4 justify-center sm:justify-start relative">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUpvote}
                    className="flex items-center gap-2"
                >
                    <ChevronUp className="h-4 w-4" />
                    {voteCount > 0 ? voteCount : "0"}
                    <span className="border-l border-gray-300 pl-2">
                        {hasUpvoted ? "Undo Upvote" : "Upvote"}
                    </span>
                </Button>

                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBookmark}
                    className="flex items-center gap-2"
                >
                    {hasBookmarked ? (
                        <>
                            <BookmarkCheck className="h-4 w-4" /> Bookmarked
                        </>
                    ) : (
                        <>
                            <Bookmark className="h-4 w-4" /> Save
                        </>
                    )}
                </Button>

                {mode === "short" && (
                    <Button variant="outline" size="sm" onClick={() => router.push(`/blog/${id}`)}>
                        Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default BlogCard;
