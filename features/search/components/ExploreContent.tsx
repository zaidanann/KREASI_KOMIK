"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";

export function ExploreContent() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading } = useQuery({
    queryKey: ["explore", debouncedQuery],
    queryFn: async () => {
      const url = debouncedQuery ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : "/api/posts/trending";
      const res = await fetch(url);
      return res.json();
    },
    enabled: true,
  });

  return (
    <div className="p-4 space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari pengguna atau postingan..."
          className="input-field pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-500" /></div>
      ) : debouncedQuery && data?.users?.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400">Pengguna</h3>
          {data.users.map((u: any) => (
            <Link key={u.id} href={`/profile/${u.username}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-200 transition-colors">
              <Avatar src={u.profile?.avatar} name={u.name} size="sm" />
              <div>
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : !debouncedQuery && data?.posts ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Trending</h3>
          <div className="grid grid-cols-3 gap-0.5">
            {data.posts.map((p: any) => {
              const img = p.media?.[0];
              return img ? (
                <Link key={p.id} href={`/post/${p.id}`} className="aspect-square bg-dark-300 relative overflow-hidden group">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : null;
            })}
          </div>
        </div>
      ) : debouncedQuery ? (
        <div className="text-center py-8 text-gray-500 text-sm">Tidak ada hasil untuk "{debouncedQuery}"</div>
      ) : null}
    </div>
  );
}
