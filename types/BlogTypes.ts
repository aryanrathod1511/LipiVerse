// BlogTypes.ts
export interface Blog {
  id: number;
  title: string;
  excerpt?: string;
  content: string;
  imageUrl?: string | null;
  upvotes?: number;
}

// Define the structure of a Bookmark
export interface Bookmark {
  id: number;         // Unique identifier for the bookmark (if needed)
  postId: number;    // The ID of the blog post being bookmarked
  userId: number;    // The ID of the user who created the bookmark
  createdAt: Date;   // Timestamp for when the bookmark was created
}

// Update the BlogCardProps to include bookmark-related props
export interface BlogCardProps {
  blog: Blog;                   // Blog object passed as prop
  mode: "short" | "full";      // Mode for displaying content
  onUpvote?: (blogId: number) => Promise<void>; // Upvote function
  onBookmark?: (blogId: number) => Promise<void>; // Bookmark function
  isBookmarked?: boolean;      // Flag indicating if the blog is bookmarked
}