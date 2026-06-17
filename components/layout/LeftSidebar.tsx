"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Search, Bell, Bookmark, Settings,
  MessageCircle, PlusSquare, LogOut,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { APP_NAME } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { POLLING_INTERVAL } from "@/constants";

interface LeftSidebarProps {
  user: { id: string; name: string; username: string; image?: string | null };
}

const navItems = [
  { href: "/",              label: "Beranda",    icon: Home },
  { href: "/explore",       label: "Jelajahi",   icon: Search },
  { href: "/notifications", label: "Notifikasi", icon: Bell },
  { href: "/chat",          label: "Pesan",      icon: MessageCircle },
  { href: "/bookmarks",     label: "Tersimpan",  icon: Bookmark },
  { href: "/create",        label: "Buat Post",  icon: PlusSquare },
  { href: "/settings",      label: "Pengaturan", icon: Settings },
];

export function LeftSidebar({ user }: LeftSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: POLLING_INTERVAL,
    enabled: !!session,
  });

  const unreadCount: number = notifData?.unreadCount ?? 0;

  return (
    <div className="flex flex-col h-full px-2">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 py-5 mb-2">
        <Image
  src="/images/Komik.png"
  alt="KREASI"
  width={40}
  height={40}
  className="rounded-xl object-contain w-10 h-10"
  style={{ objectFit: "contain" }}
/>
        <span className="text-xl font-black text-gradient">KREASI</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", isActive && "active")}
            >
              <Icon
                className="w-5 h-5 shrink-0"
                style={{ color: isActive ? "var(--brand)" : undefined }}
              />
              <span
                className={cn(isActive && "font-semibold")}
                style={{ color: isActive ? "var(--foreground)" : undefined }}
              >
                {label}
              </span>
              {label === "Notifikasi" && unreadCount > 0 && (
                <span
                  className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ backgroundColor: "var(--brand)" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile + logout */}
      <div
        className="mt-auto pt-4"
        style={{ borderTop: "1px solid var(--card-border)" }}
      >
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
          style={{ color: "var(--foreground)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--card)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <Avatar src={user.image} name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
              @{user.username}
            </p>
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-link w-full mt-1"
          style={{ color: "#f87171" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#fca5a5";
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#f87171";
            (e.currentTarget as HTMLElement).style.backgroundColor =
              "transparent";
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}