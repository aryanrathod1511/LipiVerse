"use client";

import { ChangeEvent, MouseEvent, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Appbar } from "../components/Appbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BounceLoader } from "react-spinners"; 

export default function WriteBlogPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [isImageGenerating, setIsImageGenerating] = useState(false); 
    const [isPublishing, setIsPublishing] = useState(false);
    const [activeTab, setActiveTab] = useState("write");
    const { data: session, status } = useSession();
    const router = useRouter();

    // Handle Image Generation
    const handleGenerateImage = async () => {
        if (!content) {
            alert("Please enter some content before generating an image.");
            return;
        }

        if (isImageUploading || isImageGenerating || isPublishing) return;

        setIsImageGenerating(true);

        try {
            const response = await fetch("/api/generateImage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: content }),
            });

            if (response.ok) {
                const { imageUrl } = await response.json();
                setImageUrl(imageUrl);
            } else {
                const errorData = await response.json();
                alert(errorData.error);
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsImageGenerating(false);
        }
    };

    // Handle Image Upload
    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImageUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/pranjaloncloud/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setImageUrl(data.secure_url || '');
        } catch (error) {
            console.error("Image upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setIsImageUploading(false);
        }
    };

    // Handle Submit (Publish Blog)
    const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!title || !content) {
            alert("Title and content are required.");
            return;
        }
        if (isImageUploading || isImageGenerating || isPublishing) return; 

        setIsPublishing(true);

        try {
            const response = await fetch("/api/write-blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, image: imageUrl }),
            });
            if (response.ok) {
                await response.json();
                router.push('/');
            } else alert("Failed to publish.");
        } catch (error) {
            console.error("POST error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsPublishing(false); 
        }
    };

    // Handle Save as Draft
    const handleSaveDraft = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!title && !content) {
            alert("Please enter a title or content to save as draft.");
            return;
        }
        if (isImageUploading || isImageGenerating || isPublishing) return;

        setIsPublishing(true);

        try {
            const response = await fetch("/api/write-blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, image: imageUrl, status: 'DRAFT' }),
            });
            if (response.ok) {
                await response.json();
                router.push('/my-blogs');
            } else alert("Failed to save draft.");
        } catch (error) {
            console.error("POST error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.push("/auth/signin");
    }, [status, router]);

    // Check if any of the operations is in progress
    const isLoading = isImageUploading || isImageGenerating || isPublishing;

    return (
        <div className="min-h-screen flex flex-col relative">
            <Appbar isBlogPage={true} />
            {session && (
                <div className="min-h-screen bg-gray-50">
                    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <BackButton />
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Blog</h1>
                        <form className="bg-white shadow-md rounded-lg p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter your blog title"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full"
                                />
                                {isImageUploading && <p>Uploading image, please wait...</p>}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button type="button" onClick={handleGenerateImage} disabled={!content || isImageUploading || isImageGenerating}>
                                    Generate Image
                                </Button>
                                <Button type="button" onClick={handleSaveDraft} disabled={isLoading} variant="secondary">
                                    Save as Draft
                                </Button>
                            </div>

                            {/* Render the generated image if imageUrl is set */}
                            {imageUrl && (
                                <div className="mt-4">
                                    <h2>Generated Image Preview</h2>
                                    <img src={imageUrl} alt="Generated Preview" className="w-full h-auto mt-2" />
                                </div>
                            )}

                            <div className="flex border-b border-black-200 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("write")}
                                    className={`px-4 py-2 ${activeTab === "write" ? "border-b-2 border-black-500 text-black-500" : "text-gray-500"}`}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("preview")}
                                    className={`px-4 py-2 ${activeTab === "preview" ? "border-b-2 border-black-500 text-black-500" : "text-gray-500"}`}
                                >
                                    Preview
                                </button>
                            </div>

                            {activeTab === "write" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content (Markdown supported)</Label>
                                    <textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write your blog content here using Markdown..."
                                        className="w-full h-64"
                                    />
                                </div>
                            ) : (
                                <div className="p-6 bg-gray-100 rounded-lg">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || "*Nothing to preview*"}
                                    </ReactMarkdown>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <Button type="button" onClick={handleSubmit} disabled={isPublishing || isImageUploading || isImageGenerating}>
                                    Publish
                                </Button>
                            </div>
                        </form>
                    </main>
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
                    <BounceLoader size={60} color="#000000" />
                </div>
            )}
        </div>
    );
}

// Add a simple back button component
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
