"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Video } from "lucide-react";
import { formatCount } from "@/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";

export function ProfileGrid({ username }: { username: string }) {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["profile-posts", username],
    queryFn: async ({ pageParam }) => {
      const url = pageParam
        ? `/api/users/${username}/posts?cursor=${pageParam}`
        : `/api/users/${username}/posts`;
      const res = await fetch(url);
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
        <p className="text-4xl">📷</p>
        <p className="text-sm">Belum ada postingan</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post: any) => {
          const media = post.media?.[0];
          return (
            <Link key={post.id} href={`/post/${post.id}`} className="relative aspect-square bg-dark-300 group overflow-hidden">
              {media?.type === "VIDEO" ? (
                <div className="w-full h-full bg-dark-400 flex items-center justify-center">
                  <Video className="w-6 h-6 text-gray-400" />
                </div>
              ) : media ? (
                <Image src={media.url} alt="" fill className="object-cover" sizes="200px" />
              ) : (
                <div className="w-full h-full bg-dark-400" />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-semibold">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-white" /> {formatCount(post._count.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 fill-white" /> {formatCount(post._count.comments)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button onClick={() => fetchNextPage()} className="btn-outline text-sm">Muat Lagi</button>
        </div>
      )}
    </div>
  );
}
