"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, UserPlus, Mail, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { cn } from "@/utils/cn";

export type ToastNotification = {
  id: string;
  type: "LIKE" | "COMMENT" | "REPLY" | "FOLLOW" | "MESSAGE";
  senderName: string;
  senderUsername: string;
  senderAvatar?: string;
  message: string;
  url?: string;
};

const iconMap = {
  LIKE:    { icon: Heart,          color: "text-red-500",    bg: "bg-red-500/10"   },
  COMMENT: { icon: MessageCircle,  color: "text-blue-400",   bg: "bg-blue-400/10"  },
  REPLY:   { icon: MessageCircle,  color: "text-purple-400", bg: "bg-purple-400/10"},
  FOLLOW:  { icon: UserPlus,       color: "text-green-400",  bg: "bg-green-400/10" },
  MESSAGE: { icon: Mail,           color: "text-brand",      bg: "bg-brand/10"     },
};

type ToastItemProps = {
  notif: ToastNotification;
  onClose: (id: string) => void;
};

function ToastItem({ notif, onClose }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const meta = iconMap[notif.type];
  const Icon = meta.icon;

  useEffect(() => {
    // Animasi masuk
    requestAnimationFrame(() => setVisible(true));

    // Auto-close setelah 5 detik
    const timer = setTimeout(() => handleClose(), 5000);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(() => onClose(notif.id), 350);
  }

  const inner = (
    <div
      className={cn(
        "flex items-start gap-3 w-80 bg-dark-200 border border-dark-300 rounded-2xl p-3 shadow-2xl",
        "transition-all duration-350",
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
      )}
    >
      {/* Avatar + icon badge */}
      <div className="relative shrink-0">
        <Avatar src={notif.senderAvatar} name={notif.senderName} size="sm" />
        <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center", meta.bg)}>
          <Icon className={cn("w-3 h-3", meta.color)} />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{notif.senderName}</p>
        <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{notif.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="shrink-0 p-0.5 rounded-full hover:bg-dark-300 text-gray-500 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return notif.url ? (
    <Link href={notif.url} onClick={handleClose}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Container ────────────────────────────────────────────
let _addToast: ((notif: ToastNotification) => void) | null = null;

export function triggerNotificationToast(notif: ToastNotification) {
  _addToast?.(notif);
}

export function NotificationToastContainer() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    _addToast = (notif) => {
      setToasts((prev) => {
        // Maksimal 4 toast sekaligus
        const next = [notif, ...prev].slice(0, 4);
        return next;
      });
    };
    return () => { _addToast = null; };
  }, []);

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} notif={t} onClose={removeToast} />
      ))}
    </div>
  );
}
