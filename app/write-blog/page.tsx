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
import SuggestionButton from "../components/ui/SuggestionButton";
import Image from "next/image";

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
    const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [isTitleSuggesting, setIsTitleSuggesting] = useState(false);
    const [isTagSuggesting, setIsTagSuggesting] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);

    // Handle Image Generation
    const handleGenerateImage = async () => {
        if (!title) {
            alert("Please enter a title before generating an image.");
            return;
        }
        if (isImageUploading || isImageGenerating || isPublishing) return;
        setIsImageGenerating(true);
        try {
            const response = await fetch("/api/generateImage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });
            if (response.ok) {
                const { imageUrl } = await response.json();
                setImageUrl(imageUrl);
            } else {
                alert("The developer has reached the limit for the AI API. Please try again later.");
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

    // Fetch title suggestions on demand
    const fetchTitleSuggestions = async () => {
        if (title.trim().length < 5) return;
        setIsTitleSuggesting(true);
        try {
            const res = await fetch("/api/title-suggestion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partialTitle: title }),
            });
            if (!res.ok) {
                alert("The developer has reached the limit for the AI API. Please try again later.");
                setTitleSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            const data = await res.json();
            setTitleSuggestions(data.suggestions || []);
            setShowSuggestions((data.suggestions || []).length > 0);
        } catch {
            setTitleSuggestions([]);
            setShowSuggestions(false);
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
                body: JSON.stringify({ title, content, image: imageUrl, tags }),
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
                body: JSON.stringify({ title, content, image: imageUrl, status: 'DRAFT', tags }),
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

    // In handleSubmit and handleSaveDraft, disable Publish if content is empty
    const isPublishDisabled = !content.trim() || isImageUploading || isImageGenerating || isPublishing;

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
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter your blog title"
                                        className="w-full"
                                    />
                                    <SuggestionButton label="Suggest" onClick={fetchTitleSuggestions} loading={isTitleSuggesting} disabled={title.trim().length < 5} />
                                </div>
                                {showSuggestions && titleSuggestions.length > 0 && (
                                    <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2">
                                        <div className="text-xs text-gray-500 mb-1">AI Title Suggestions:</div>
                                        <ul>
                                            {titleSuggestions.map((suggestion, idx) => (
                                                <li key={idx}>
                                                    <button
                                                        type="button"
                                                        className="text-left w-full hover:bg-gray-100 px-2 py-1 rounded"
                                                        onClick={() => setTitle(suggestion)}
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
                                <Button type="button" onClick={handleGenerateImage} disabled={!title || isImageUploading || isImageGenerating}>
                                    Generate Image
                                </Button>
                                
                            </div>

                            {/* Render the generated image if imageUrl is set */}
                            {imageUrl && (
                                <div className="mt-4">
                                    <h2>Generated Image Preview</h2>
                                    <Image src={imageUrl} alt="Generated Preview" width={600} height={400} className="w-full h-auto mt-2" />
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

                            {/* Confirmation popup for publish */}
                            {showPublishConfirm && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                                        <h2 className="text-lg font-semibold mb-4">Confirm Publish</h2>
                                        <p className="mb-6">Are you sure you want to publish this blog?</p>
                                        <div className="flex justify-end gap-4">
                                            <Button variant="outline" onClick={() => setShowPublishConfirm(false)}>Cancel</Button>
                                            <Button variant="default" onClick={handleSubmit}>Yes, Publish</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isPublishing}>
                                    Save as Draft
                                </Button>
                                <Button type="button" onClick={() => setShowPublishConfirm(true)} disabled={isPublishDisabled}>
                                    {isPublishing ? "Publishing..." : "Publish"}
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
