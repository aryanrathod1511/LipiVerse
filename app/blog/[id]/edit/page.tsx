"use client";

import React, { useState, useEffect } from "react";
import { BlogCardProps } from "@/types/BlogTypes";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Appbar } from "@/app/components/Appbar";
import { Blog } from "@/types/BlogTypes";
import SuggestionButton from "@/app/components/ui/SuggestionButton";
import { BounceLoader } from "react-spinners";

const EditBlog: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();
    const [blog, setBlog] = useState<BlogCardProps | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
    const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
    const [isTitleSuggesting, setIsTitleSuggesting] = useState(false);
    const [isTagSuggesting, setIsTagSuggesting] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [showDraftConfirm, setShowDraftConfirm] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                if (!id) return;
                const res = await fetch(`/api/blog/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setBlog(data);
                    setTitle(data.title || "");
                    setContent(data.content || "");
                    setImageUrl(data.imageUrl || "");
                    if (Array.isArray(data.tags) && data.tags.length > 0 && typeof data.tags[0] === 'object') {
                        setTags(data.tags.map((t: any) => t.name));
                    } else {
                        setTags(data.tags || []);
                    }
                } else {
                    console.error("Blog not found:", await res.text());
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
            }
        };
        fetchBlog();
    }, [id]);

    // AI Tag Suggestions
    // useEffect(() => {
    //     if ((title.trim().length > 0 || content.trim().length > 0) && (tagInput.trim().length > 0 || tags.length === 0)) {
    //         const fetchTagSuggestions = async () => {
    //             try {
    //                 const res = await fetch("/api/tag-suggestion", {
    //                     method: "POST",
    //                     headers: { "Content-Type": "application/json" },
    //                     body: JSON.stringify({ title, content }),
    //                 });
    //                 const data = await res.json();
    //                 setTagSuggestions(data.suggestions || []);
    //                 setShowTagSuggestions(true);
    //             } catch {
    //                 setTagSuggestions([]);
    //                 setShowTagSuggestions(false);
    //             }
    //         };
    //         fetchTagSuggestions();
    //     } else {
    //         setShowTagSuggestions(false);
    //     }
    // }, [title, content, tagInput]);

    // Add tag from input
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };
    // Remove tag
    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };
    // Add tag from suggestion
    const handleAddTagFromSuggestion = (suggestion: string) => {
        if (!tags.includes(suggestion)) {
            setTags([...tags, suggestion]);
        }
        setShowTagSuggestions(false);
        setTagInput("");
    };
    // Add title from suggestion
    const handleAddTitleFromSuggestion = (suggestion: string) => {
        setTitle(suggestion);
        setShowTitleSuggestions(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            try {
                const res = await fetch("/api/updatePostImage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ postId: id, image: reader.result }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setImageUrl(data.imageUrl);
                } else {
                    console.error("Failed to update post image:", await res.json());
                }
            } catch (err) {
                console.error("Error uploading image:", err);
            } finally {
                setLoading(false);
            }
        };
    };

    // Fetch title suggestions on demand
    const fetchTitleSuggestions = async () => {
        if (title.trim().length === 0) return;
        setIsTitleSuggesting(true);
        setShowTitleSuggestions(true);
        try {
            const res = await fetch("/api/title-suggestion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partialTitle: title }),
            });
            if (!res.ok) {
                alert("The developer has reached the limit for the AI API. Please try again later.");
                setTitleSuggestions([]);
                setShowTitleSuggestions(false);
                return;
            }
            const data = await res.json();
            setTitleSuggestions(data.suggestions || []);
        } catch {
            setTitleSuggestions([]);
        } finally {
            setIsTitleSuggesting(false);
        }
    };

    // Fetch tag suggestions on demand
    const fetchTagSuggestions = async () => {
        setIsTagSuggesting(true);
        setShowTagSuggestions(true);
        try {
            const res = await fetch("/api/tag-suggestion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blogContent: content }),
            });
            if (!res.ok) {
                alert("The developer has reached the limit for the AI API. Please try again later.");
                setTagSuggestions([]);
                setShowTagSuggestions(false);
                return;
            }
            const data = await res.json();
            setTagSuggestions(data.tags || []);
        } catch {
            setTagSuggestions([]);
        } finally {
            setIsTagSuggesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, imageUrl, tags }),
            });

            if (res.ok) {
                router.push(`/my-blogs`);
            }
        } catch (error) {
            console.error("Error updating post", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Add a function to publish a draft blog
    const handlePublish = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, imageUrl, tags, status: 'PUBLISHED' }),
            });
            if (res.ok) {
                router.push(`/my-blogs`);
            }
        } catch (error) {
            console.error("Error publishing post", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Add a function to update as draft
    const handleUpdateDraft = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, imageUrl, tags, status: 'DRAFT' }),
            });
            if (res.ok) {
                router.push(`/my-blogs`);
            }
        } catch (error) {
            console.error("Error updating draft", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // In handleSubmit, disable Update Blog if content is empty
    const isUpdateDisabled = !content.trim() || isUpdating;

    if (!blog) return <div className="flex justify-center items-center min-h-screen"><BounceLoader size={60} color="#000000" /></div>;

    return (
        <div className="min-h-screen flex flex-col">
            <Appbar isBlogPage={true} />
            <div className="flex justify-center pt-4">
                <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl w-full mx-4 sm:mx-8 my-8">
                    <BackButton />
                    <div className="flex border-b border-gray-300 mb-6">
                        <button
                            className={`p-4 text-lg font-medium ${!isPreview ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                            onClick={() => setIsPreview(false)}
                        >
                            Edit
                        </button>
                        <button
                            className={`p-4 text-lg font-medium ${isPreview ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                            onClick={() => setIsPreview(true)}
                        >
                            Preview
                        </button>
                    </div>

                    {!isPreview ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full"
                                    />
                                    <SuggestionButton label="Suggest" onClick={fetchTitleSuggestions} loading={isTitleSuggesting} disabled={title.trim().length === 0} />
                                </div>
                                {showTitleSuggestions && titleSuggestions.length > 0 && (
                                    <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2">
                                        <div className="text-xs text-gray-500 mb-1">AI Title Suggestions:</div>
                                        <ul>
                                            {titleSuggestions.map((suggestion, idx) => (
                                                <li key={idx}>
                                                    <button
                                                        type="button"
                                                        className="text-left w-full hover:bg-gray-100 px-2 py-1 rounded"
                                                        onClick={() => handleAddTitleFromSuggestion(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-64"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Upload Image</Label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                                {imageUrl && (
                                    <div className="relative w-full h-64 mt-2">
                                        <Image
                                            src={imageUrl}
                                            alt={title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-lg"
                                        />
                                    </div>
                                )}
                                {loading && <p>Uploading image...</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag) => (
                                        <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
                                            {tag}
                                            <button type="button" className="ml-1 text-blue-500 hover:text-red-500" onClick={() => handleRemoveTag(tag)}>&times;</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id="tags"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="Add a tag and press Enter"
                                        className="w-full"
                                    />
                                    <SuggestionButton label="Suggest" onClick={fetchTagSuggestions} loading={isTagSuggesting} />
                                </div>
                                {showTagSuggestions && tagSuggestions.length > 0 && (
                                    <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2">
                                        <div className="text-xs text-gray-500 mb-1">AI Tag Suggestions:</div>
                                        <ul>
                                            {tagSuggestions.map((suggestion, idx) => (
                                                <li key={idx}>
                                                    <button
                                                        type="button"
                                                        className="text-left w-full hover:bg-gray-100 px-2 py-1 rounded"
                                                        onClick={() => handleAddTagFromSuggestion(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                {/* Show Update as Draft and Publish buttons if blog is a draft */}
                                {blog && blog.status === 'DRAFT' ? (
                                    <>
                                        <Button type="button" variant="outline" onClick={() => setShowDraftConfirm(true)} disabled={isUpdateDisabled}>
                                            {isUpdating ? "Updating..." : "Update as Draft"}
                                        </Button>
                                        <Button type="button" variant="default" onClick={() => setShowPublishConfirm(true)} disabled={isUpdateDisabled}>
                                            {isUpdating ? "Publishing..." : "Publish"}
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="submit" disabled={isUpdateDisabled}>
                                        {isUpdating ? "Updating..." : "Update Blog"}
                                    </Button>
                                )}
                            </div>
                            {/* Confirmation popups */}
                            {showPublishConfirm && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                                        <h2 className="text-lg font-semibold mb-4">Confirm Publish</h2>
                                        <p className="mb-6">Are you sure you want to publish this blog?</p>
                                        <div className="flex justify-end gap-4">
                                            <Button variant="outline" onClick={() => setShowPublishConfirm(false)}>Cancel</Button>
                                            <Button variant="default" onClick={handlePublish}>Yes, Publish</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-bold mb-4">{title}</h1>
                            {imageUrl && (
                                <Image
                                    src={imageUrl}
                                    alt={title}
                                    width={600}
                                    height={400}
                                    quality={100}
                                    className="w-full h-auto object-cover mb-4 rounded-lg"
                                />
                            )}
                            <ReactMarkdown className="prose prose-sm sm:prose lg:prose-lg" remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function BackButton() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
        >
            ← Back
        </button>
    );
}

export default EditBlog;
