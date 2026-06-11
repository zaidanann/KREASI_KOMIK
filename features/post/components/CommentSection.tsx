"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { Loader2, Send } from "lucide-react";
import { formatRelativeTime } from "@/utils/cn";
import toast from "react-hot-toast";
import type { CommentWithUser } from "@/types";

export function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`);
      return res.json() as Promise<{ comments: CommentWithUser[] }>;
    },
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Gagal mengirim komentar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setText("");
    },
    onError: () => toast.error("Gagal mengirim komentar"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    mutation.mutate(text.trim());
  };

  return (
    <div className="mt-3 border-t border-dark-300 pt-3">
      {/* Input */}
      {session && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Avatar src={session.user.image} name={session.user.name} size="xs" />
          <div className="flex-1 flex items-center gap-2 bg-dark-200 rounded-xl px-3 py-2 border border-dark-400 focus-within:border-brand">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tambah komentar..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-600"
              maxLength={500}
            />
            <button type="submit" disabled={!text.trim() || mutation.isPending}
              className="text-brand disabled:opacity-40 hover:text-brand-400 transition-colors">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.comments ?? []).map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar src={c.user.profile?.avatar} name={c.user.name} size="xs" />
              <div className="flex-1">
                <div className="bg-dark-200 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold mr-2">{c.user.name}</span>
                  <span className="text-sm text-gray-300">{c.content}</span>
                </div>
                <span className="text-xs text-gray-600 ml-2">{formatRelativeTime(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
