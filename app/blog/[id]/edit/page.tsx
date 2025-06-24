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
                } else {
                    console.error("Blog not found:", await res.text());
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
            }
        };
        fetchBlog();
    }, [id]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const res = await fetch(`/api/blog/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, imageUrl }),
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

    if (!blog) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col">
            <Appbar isBlogPage={true} />
            <div className="flex justify-center pt-4">
                <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl w-full mx-4 sm:mx-8 my-8">
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
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full"
                                />
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

                            <div className="flex justify-end space-x-4">
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? "Updating..." : "Update Blog"}
                                </Button>
                            </div>
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

export default EditBlog;
