"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, MessageCircle, Bell } from "lucide-react";
import { cn } from "@/utils/cn";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { POLLING_INTERVAL } from "@/constants";

const navItems = [
  { href: "/",              icon: Home,          label: "Beranda" },
  { href: "/explore",       icon: Search,        label: "Jelajahi" },
  { href: "/create",        icon: PlusSquare,    label: "Buat",   isPrimary: true },
  { href: "/notifications", icon: Bell,          label: "Notif",  isBell: true },
  { href: "/chat",          icon: MessageCircle, label: "Pesan" },
];

export function BottomNav() {
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-dark-300">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label, isPrimary, isBell }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center transition-all",
                isPrimary
                  ? "bg-brand text-white rounded-xl"
                  : isActive
                  ? "text-brand"
                  : "text-gray-500"
              )}
            >
              {/* Bell icon dengan badge */}
              <div className="relative">
                <Icon className={cn("w-5 h-5", isPrimary && "text-white")} />
                {isBell && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-brand rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              {!isPrimary && <span className="text-[10px] font-medium">{label}</span>}
            </Link>
          );
        })}

        {/* Profile */}
        {session?.user && (
          <Link
            href={`/profile/${session.user.username}`}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center",
              pathname.startsWith("/profile") ? "text-brand" : "text-gray-500"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full overflow-hidden border-2",
              pathname.startsWith("/profile") ? "border-brand" : "border-gray-600"
            )}>
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand flex items-center justify-center text-white text-xs font-bold">
                  {session.user.name?.[0]}
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        )}
      </div>
    </nav>
  );
}