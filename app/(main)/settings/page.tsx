import type { Metadata } from "next";
import Link from "next/link";
import { User, Lock, Bell, Shield, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Pengaturan" };

const settingsMenu = [
  {
    href: "/settings/profile",
    icon: User,
    label: "Edit Profil",
    desc: "Ubah nama, username, bio, foto",
  },
  {
    href: "/settings/security",
    icon: Lock,
    label: "Keamanan",
    desc: "Ubah password akun",
  },
  {
    href: "/settings/notifications",
    icon: Bell,
    label: "Notifikasi",
    desc: "Kelola preferensi notifikasi",
  },
  {
    href: "/settings/privacy",
    icon: Shield,
    label: "Privasi",
    desc: "Kelola pengaturan privasi akun",
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Pengaturan</h1>
      </div>
      <div className="divide-y divide-dark-300">
        {settingsMenu.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-4 py-4 hover:bg-dark-100/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-dark-300 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
