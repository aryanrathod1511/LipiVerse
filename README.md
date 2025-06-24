# Tech Stack Used:
1. Next.js
2. Cloudinary
3. Vercel
4. Postgres
5. Prisma
6. Render
7. Typescript
8. EmailJS
9. NextAuth

# LipiVerse Blog Platform

## API Setup Instructions

### 1. Google Gemini API Key (for Title and Tag Suggestions)
- **Get your free API key here:** https://aistudio.google.com/app/apikey
- After signing up/logging in, create a new API key and copy it.
- Add it to your environment variables as `GEMINI_API_KEY` (e.g., in a `.env` file or your deployment environment).

### 2. Image Generation (Blog Cover Photos)
- **Default:** Uses [Lexica.art](https://lexica.art/) API, which is totally free and requires no API key.
- If you want higher quality or custom images, you can upgrade to [OpenAI DALL·E](https://platform.openai.com/docs/guides/images) and update the backend code to use your OpenAI API key for image generation.

---

Lipiverse is a modern blog and content-sharing platform built with Next.js. It offers a clean UI for creating, editing, and managing posts, powered by server-side rendering and API routes. Fully responsive and deployable via Vercel, it's optimized for performance, scalability, and simplicity.
