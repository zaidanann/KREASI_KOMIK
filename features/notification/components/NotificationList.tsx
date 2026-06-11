"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/utils/cn";
import { Heart, MessageCircle, UserPlus, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { POLLING_INTERVAL } from "@/constants";

const iconMap: Record<string, React.ReactNode> = {
  LIKE:    <Heart className="w-4 h-4 text-red-500" />,
  COMMENT: <MessageCircle className="w-4 h-4 text-blue-400" />,
  REPLY:   <MessageCircle className="w-4 h-4 text-purple-400" />,
  FOLLOW:  <UserPlus className="w-4 h-4 text-green-400" />,
  MESSAGE: <Mail className="w-4 h-4 text-brand" />,
};

export function NotificationList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: POLLING_INTERVAL,
  });

  const markAllRead = useMutation({
    mutationFn: () => fetch("/api/notifications", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div>
      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b border-dark-300 flex justify-end">
          <button onClick={() => markAllRead.mutate()}
            className="text-xs text-brand hover:text-brand-400 font-semibold">
            Tandai semua dibaca
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-500 gap-3">
          <p className="text-4xl">🔔</p>
          <p className="text-sm">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="divide-y divide-dark-300">
          {notifications.map((n: any) => (
            <div key={n.id} className={cn("flex items-start gap-3 px-4 py-4 hover:bg-dark-100/50 transition-colors",
              !n.isRead && "bg-brand/5")}>
              <div className="relative">
                <Avatar src={n.sender?.profile?.avatar} name={n.sender?.name} size="sm" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-dark-200 flex items-center justify-center">
                  {iconMap[n.type]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  {n.sender && (
                    <Link href={`/profile/${n.sender.username}`} className="font-semibold hover:text-brand">
                      {n.sender.name}{" "}
                    </Link>
                  )}
                  <span className="text-gray-400">{n.message.replace(n.sender?.name ?? "", "").trim()}</span>
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-brand rounded-full mt-1.5 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
