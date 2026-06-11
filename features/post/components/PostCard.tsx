"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRelativeTime, formatCount } from "@/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { CommentSection } from "@/features/post/components/CommentSection";
import {
  Heart, MessageCircle, Share2, Bookmark,
  Download, Flag, MoreHorizontal, UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { PostWithDetails } from "@/types";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

interface PostCardProps {
  post: PostWithDetails;
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = session?.user.id === post.user.id;
  const caption = post.caption ?? "";
  const isLong = caption.length > 150;

  const handleLike = async () => {
    if (!session) { router.push("/login"); return; }
    // Optimistic update
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const json = await res.json();
      setLiked(json.liked);
      setLikeCount(json.count);
    } catch {
      // Rollback
      setLiked(liked);
      setLikeCount(post._count.likes);
      toast.error("Gagal memproses like");
    }
  };

  const handleSave = async () => {
    if (!session) { router.push("/login"); return; }
    setSaved(!saved);
    try {
      const res = await fetch(`/api/posts/${post.id}/save`, { method: "POST" });
      const json = await res.json();
      setSaved(json.saved);
      toast.success(json.saved ? "Post disimpan" : "Post dihapus dari simpanan");
    } catch {
      setSaved(saved);
      toast.error("Gagal menyimpan post");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: "Lihat di JOTENG", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link disalin!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin hapus postingan ini?")) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post berhasil dihapus");
        queryClient.invalidateQueries({ queryKey: ["feed"] });
      }
    } catch {
      toast.error("Gagal menghapus post");
    }
  };

  const handleReport = async () => {
    // Simple report tanpa modal untuk demo
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, reason: "SPAM" }),
      });
      toast.success("Laporan terkirim. Terima kasih!");
    } catch {
      toast.error("Gagal mengirim laporan");
    }
  };

  return (
    <article className="px-4 py-4 hover:bg-dark-100/50 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/profile/${post.user.username}`}>
          <Avatar src={post.user.profile?.avatar} name={post.user.name} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Link href={`/profile/${post.user.username}`} className="font-semibold hover:text-brand transition-colors">
              {post.user.name}
            </Link>
            <span className="text-gray-500 text-sm">@{post.user.username}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-500 text-xs">{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>

        {/* More menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-dark-300 text-gray-500">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-8 w-44 card py-1 z-20 shadow-xl"
              >
                {!isOwner && (
                  <button onClick={() => { handleReport(); setShowMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-red-400">
                    <Flag className="w-4 h-4" /> Laporkan
                  </button>
                )}
                {(isOwner || session?.user.role === "ADMIN" || session?.user.role === "SUPER_ADMIN") && (
                  <button onClick={() => { handleDelete(); setShowMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-red-400">
                    <Flag className="w-4 h-4" /> Hapus Post
                  </button>
                )}
                <button onClick={() => { handleShare(); setShowMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300">
                  <Share2 className="w-4 h-4" /> Salin Link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <div className="mb-3 text-sm leading-relaxed">
          <span>{isLong && !expanded ? caption.slice(0, 150) + "... " : caption}</span>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-brand text-xs font-semibold ml-1">
              {expanded ? "Sembunyikan" : "Lihat Selengkapnya"}
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <MediaCarousel media={post.media} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1">
        {/* Like */}
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
            liked ? "text-red-500 bg-red-500/10" : "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
          )}
        >
          <Heart className={cn("w-4 h-4 transition-transform", liked && "fill-current scale-110")} />
          <span>{formatCount(likeCount)}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{formatCount(post._count.comments)}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ml-auto",
            saved ? "text-brand bg-brand/10" : "text-gray-500 hover:text-brand hover:bg-brand/10"
          )}
        >
          <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
        </button>
      </div>

      {/* Comment Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
