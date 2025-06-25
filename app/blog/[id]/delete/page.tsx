"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BounceLoader } from "react-spinners";

const DeleteBlog = () => {
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        if (!id) return;

        const deleteBlog = async () => {
            try {
                const res = await fetch(`/api/blog/${id}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    router.push(`/my-blogs`);
                } else {
                    const errorData = await res.json();
                    console.error('Failed to delete blog:', errorData.message);
                }
            } catch (error) {
                console.error('Error deleting blog:', error);
            }
        };

        deleteBlog();
    }, [id, router]);

    return <div className="flex justify-center items-center min-h-screen"><BounceLoader size={60} color="#000000" /></div>;
};

export default DeleteBlog;
