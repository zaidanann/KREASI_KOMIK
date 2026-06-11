"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { PostCard } from "@/features/post/components/PostCard";
import { PostSkeleton } from "@/components/ui/Skeleton";
import type { PostWithDetails } from "@/types";

async function fetchFeed({ pageParam }: { pageParam: string | null }) {
  const url = pageParam ? `/api/posts?cursor=${pageParam}` : "/api/posts";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat feed");
  return res.json() as Promise<{ posts: PostWithDetails[]; nextCursor: string | null }>;
}

export function Feed() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: fetchFeed,
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  // Intersection Observer untuk auto-load
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  if (isLoading) {
    return (
      <div className="divide-y divide-dark-300">
        {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
        <p className="text-4xl">😕</p>
        <p>Gagal memuat feed. Coba lagi.</p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
        <p className="text-4xl">👋</p>
        <p>Belum ada postingan. Follow pengguna lain untuk melihat feed!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-dark-300">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-brand rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-xs text-gray-600">Kamu sudah melihat semua postingan ✨</p>
        )}
      </div>
    </div>
  );
}
