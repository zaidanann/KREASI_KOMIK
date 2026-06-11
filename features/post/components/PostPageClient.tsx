"use client";

import { PostCard } from "@/features/post/components/PostCard";
import { CommentSection } from "@/features/post/components/CommentSection";
import type { PostWithDetails } from "@/types";

export function PostPageClient({ post }: { post: PostWithDetails }) {
  return (
    <div>
      <PostCard post={post} />
      <div className="border-t border-dark-300 px-4 py-4">
        <h2 className="font-bold text-sm mb-4 text-gray-400">Semua Komentar</h2>
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
