"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, FileText, Heart, MessageCircle, Flag, Loader2 } from "lucide-react";
import { formatCount } from "@/utils/cn";

// Komponen chart ringan tanpa recharts untuk menghindari breaking change
function SimpleBarChart({ data }: { data: Array<{ date: string; users: number; posts: number }> }) {
  if (!data?.length) return null;
  const maxVal = Math.max(...data.flatMap((d) => [d.users, d.posts]), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex gap-0.5 items-end" style={{ height: "120px" }}>
              <div
                className="flex-1 bg-brand rounded-t-sm transition-all"
                style={{ height: `${(d.users / maxVal) * 100}%`, minHeight: d.users > 0 ? "4px" : "0" }}
              />
              <div
                className="flex-1 bg-purple-500 rounded-t-sm transition-all"
                style={{ height: `${(d.posts / maxVal) * 100}%`, minHeight: d.posts > 0 ? "4px" : "0" }}
              />
            </div>
            <span className="text-[10px] text-gray-600 truncate w-full text-center">{d.date}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-brand inline-block" /> Pengguna
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" /> Postingan
        </span>
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{formatCount(value ?? 0)}</p>
    </div>
  </div>
);

export function AdminDashboardClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetch("/api/admin/stats").then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const { totals, dailyStats, newUsersThisWeek, newPostsThisWeek } = data ?? {};

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan statistik platform JOTENG</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users}         label="Total Pengguna"  value={totals?.users}    color="bg-brand" />
        <StatCard icon={FileText}      label="Total Postingan" value={totals?.posts}    color="bg-purple-600" />
        <StatCard icon={MessageCircle} label="Total Komentar"  value={totals?.comments} color="bg-blue-600" />
        <StatCard icon={Heart}         label="Total Like"      value={totals?.likes}    color="bg-red-600" />
        <StatCard icon={MessageCircle} label="Total Pesan"     value={totals?.messages} color="bg-green-600" />
        <StatCard icon={Flag}          label="Laporan Pending" value={totals?.reports}  color="bg-orange-600" />
      </div>

      {/* Weekly highlights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Pengguna baru minggu ini</p>
          <p className="text-3xl font-bold text-green-400 mt-1">+{newUsersThisWeek ?? 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Postingan baru minggu ini</p>
          <p className="text-3xl font-bold text-brand mt-1">+{newPostsThisWeek ?? 0}</p>
        </div>
      </div>

      {/* Chart */}
      {dailyStats && (
        <div className="card p-5">
          <h2 className="font-bold mb-4">Aktivitas 7 Hari Terakhir</h2>
          <SimpleBarChart data={dailyStats} />
        </div>
      )}
    </div>
  );
}
