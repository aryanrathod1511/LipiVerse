import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();
        if (!prompt || prompt.length < 10) {
            return NextResponse.json(
                { error: 'Please provide a more descriptive text to generate an image.' },
                { status: 400 }
            );
        }

        // Generate image using Stable Diffusion
        const imageBlob = await generateImageFromStableDiffusion(prompt);

        // Upload the image to Cloudinary
        const formData = new FormData();
        formData.append('file', new Blob([imageBlob], { type: 'image/png' }));
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
            throw new Error(uploadResult.error?.message || "Failed to upload image to Cloudinary.");
        }

        return NextResponse.json({ imageUrl: uploadResult.secure_url }, { status: 200 });
    } catch (error) {
        console.error("Error generating or uploading image:", error);
        return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
    }
}

async function generateImageFromStableDiffusion(prompt: string): Promise<Blob> {
    const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.STABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image.');
    }

    return await response.blob();
}
