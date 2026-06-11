"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { PostCard } from "@/features/post/components/PostCard";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { Bookmark } from "lucide-react";
import type { PostWithDetails } from "@/types";

export function BookmarksFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: async ({ pageParam }) => {
      const url = pageParam ? `/api/users/bookmarks?cursor=${pageParam}` : "/api/users/bookmarks";
      const res = await fetch(url);
      return res.json() as Promise<{ posts: PostWithDetails[]; nextCursor: string | null }>;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) return <div className="divide-y divide-dark-300">{Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}</div>;

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
        <Bookmark className="w-12 h-12 text-gray-600" />
        <p>Belum ada postingan tersimpan</p>
        <p className="text-xs text-gray-600">Tekan ikon bookmark pada postingan untuk menyimpannya</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-dark-300">
      {posts.map((post) => <PostCard key={post.id} post={post} />)}
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button onClick={() => fetchNextPage()} className="btn-outline text-sm">Muat Lagi</button>
        </div>
      )}
    </div>
  );
}
