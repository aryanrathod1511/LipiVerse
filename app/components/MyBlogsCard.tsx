"use client";

import Link from "next/link";
import React, { useState } from "react";
import { BlogCardProps } from "@/types/BlogTypes";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MyBlogCard: React.FC<BlogCardProps> = ({ blog }) => {
    const router = useRouter();
    const [image] = useState(blog.imageUrl || "");
    const [showConfirm, setShowConfirm] = useState(false);

    const handleEditClick = () => {
        router.push(`/blog/${blog.id}/edit`);
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    return (
        <div className="myblog-card flex flex-col space-y-2 border-2 px-3 py-3 h-auto">
            <h3 className="text-xl font-bold">{blog.title}</h3>
            {image && (
                <Image
                    width={600}
                    height={400}
                    quality={100}
                    src={image}
                    alt={blog.title}
                    className="w-full h-auto my-4 object-cover"
                />
            )}
            <Link className="text-sm font-medium hover:underline underline-offset-4" href={`/blog/${blog.id}`}>
                Read More
            </Link>
            <div className="flex justify-end space-x-2 mt-auto">
                <Button variant="outline" onClick={handleEditClick}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" onClick={handleDeleteClick}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
            </div>
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-2">Delete Blog</h2>
                        <p className="mb-4">Are you sure you want to delete the blog permanently?</p>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => router.push(`/blog/${blog.id}/delete`)}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBlogCard;
