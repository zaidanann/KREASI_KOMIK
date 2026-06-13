"use client";

import Link from "next/link";
import { Bell, Zap } from "lucide-react";
import { APP_NAME } from "@/constants";

export function MobileHeader({ user: _user }: { user: unknown }) {
  return (
    <header className="lg:hidden sticky top-0 z-40 glass border-b border-dark-300 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" fill="white" />
        </div>
        <span className="text-lg font-black text-gradient">{APP_NAME}</span>
      </Link>
      <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-dark-200">
        <Bell className="w-5 h-5 text-gray-400" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
      </Link>
    </header>
  );
}