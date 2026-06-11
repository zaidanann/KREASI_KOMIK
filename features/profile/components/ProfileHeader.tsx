"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { formatCount } from "@/utils/cn";
import { MessageCircle, Settings, Globe, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileHeaderProps {
  user: any;
  isFollowing: boolean;
  isOwn: boolean;
}

export function ProfileHeader({ user, isFollowing: initialFollowing, isOwn }: ProfileHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(user._count.followers);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id }),
      });
      const json = await res.json();
      setFollowing(json.following);
      setFollowerCount(json.followerCount);
      toast.success(json.following ? `Mengikuti @${user.username}` : `Berhenti mengikuti @${user.username}`);
    } catch {
      toast.error("Gagal memproses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id }),
      });
      const room = await res.json();
      router.push(`/chat/${room.id}`);
    } catch {
      toast.error("Gagal membuka chat");
    }
  };

  return (
    <div>
      {/* Cover */}
      <div className="relative h-32 sm:h-44 bg-gradient-to-br from-brand/40 to-purple-900/40 overflow-hidden">
        {user.profile?.cover && (
          <Image src={user.profile.cover} alt="Cover" fill className="object-cover" sizes="768px" />
        )}
      </div>

      {/* Avatar & Actions */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-end -mt-12 mb-3">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-dark overflow-hidden bg-dark-200">
              {user.profile?.avatar ? (
                <Image src={user.profile.avatar} alt={user.name} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-12">
            {isOwn ? (
              <Link href="/settings/profile" className="btn-outline text-sm px-4 py-2">
                <Settings className="w-4 h-4 inline mr-1" />
                Edit Profil
              </Link>
            ) : (
              <>
                <button onClick={handleMessage} className="btn-outline text-sm px-3 py-2">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button onClick={handleFollow} disabled={isLoading}
                  className={following ? "btn-outline text-sm px-4 py-2" : "btn-primary text-sm px-4 py-2"}>
                  {isLoading ? "..." : following ? "Mengikuti" : "Ikuti"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-gray-500 text-sm">@{user.username}</p>
          {user.profile?.bio && <p className="text-sm leading-relaxed mt-2">{user.profile.bio}</p>}

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            {user.profile?.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.profile.location}</span>
            )}
            {user.profile?.website && (
              <a href={user.profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-brand hover:underline">
                <Globe className="w-3 h-3" />{user.profile.website.replace("https://", "")}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-5 mt-4 pt-4 border-t border-dark-300">
          <div className="text-center">
            <span className="font-bold text-sm">{formatCount(user._count.posts)}</span>
            <p className="text-gray-500 text-xs">Postingan</p>
          </div>
          <div className="text-center">
            <span className="font-bold text-sm">{formatCount(followerCount)}</span>
            <p className="text-gray-500 text-xs">Pengikut</p>
          </div>
          <div className="text-center">
            <span className="font-bold text-sm">{formatCount(user._count.following)}</span>
            <p className="text-gray-500 text-xs">Mengikuti</p>
          </div>
        </div>
      </div>
    </div>
  );
}
