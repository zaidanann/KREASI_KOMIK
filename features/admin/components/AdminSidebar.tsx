"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Flag, BarChart2, Activity, Settings, Zap, Shield, Home } from "lucide-react";
import { cn } from "@/utils/cn";
import { APP_NAME } from "@/constants";

const adminLinks = [
  { href: "/admin",         label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/users",   label: "Pengguna",   icon: Users },
  { href: "/admin/posts",   label: "Postingan",  icon: FileText },
  { href: "/admin/reports", label: "Laporan",    icon: Flag },
  { href: "/admin/stats",   label: "Statistik",  icon: BarChart2 },
];

const superAdminLinks = [
  { href: "/super-admin",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/super-admin/users",    label: "Pengguna",   icon: Users },
  { href: "/super-admin/admins",   label: "Admin",      icon: Shield },
  { href: "/super-admin/reports",  label: "Laporan",    icon: Flag },
  { href: "/super-admin/activity", label: "Aktivitas",  icon: Activity },
  { href: "/super-admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const links = isSuperAdmin ? superAdminLinks : adminLinks;

  return (
    <aside className="w-60 shrink-0 bg-dark-100 border-r border-dark-300 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-dark-300">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <div>
            <span className="font-black text-sm text-gradient">{APP_NAME}</span>
            <p className="text-[10px] text-gray-500">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/admin" || href === "/super-admin"
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-brand text-white" : "text-gray-400 hover:text-white hover:bg-dark-300")}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-3 border-t border-dark-300">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-dark-300 transition-all">
          <Home className="w-4 h-4" /> Kembali ke Situs
        </Link>
      </div>
    </aside>
  );
}
