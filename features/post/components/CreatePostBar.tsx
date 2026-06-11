"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Image as ImageIcon, Video } from "lucide-react";

interface CreatePostBarProps {
  user: { name: string; image?: string | null };
}

export function CreatePostBar({ user }: CreatePostBarProps) {
  return (
    <div className="px-4 py-3 border-b border-dark-300 flex items-center gap-3">
      <Avatar src={user.image} name={user.name} size="md" />
      <Link href="/create" className="flex-1 bg-dark-200 hover:bg-dark-300 transition-colors rounded-xl px-4 py-2.5 text-gray-500 text-sm cursor-text">
        Apa yang kamu pikirkan?
      </Link>
      <Link href="/create" className="p-2.5 rounded-xl hover:bg-dark-200 text-brand transition-colors">
        <ImageIcon className="w-5 h-5" />
      </Link>
      <Link href="/create" className="p-2.5 rounded-xl hover:bg-dark-200 text-purple-400 transition-colors">
        <Video className="w-5 h-5" />
      </Link>
    </div>
  );
}
