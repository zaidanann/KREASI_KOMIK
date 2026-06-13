"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, Search, Bell, Bookmark, Settings,
  MessageCircle, PlusSquare, LogOut, Zap,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { APP_NAME } from "@/constants";

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

  return (
    <div className="flex flex-col h-full px-2">
      <Link href="/" className="flex items-center gap-2 px-4 py-5 mb-2">
        <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="text-xl font-black text-gradient">{APP_NAME}</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("sidebar-link", isActive && "active")}>
              <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-brand")} />
              <span className={cn(isActive && "text-white font-semibold")}>{label}</span>
              {label === "Notifikasi" && <span className="ml-auto w-2 h-2 bg-brand rounded-full" />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-dark-300">
        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-dark-200 transition-colors">
          <Avatar src={user.image} name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          </div>
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 mt-1">
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}