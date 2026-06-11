"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/Avatar";
import { Search, ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Shield, Ban, UserX, RotateCcw } from "lucide-react";
import { formatRelativeTime } from "@/utils/cn";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export function AdminUsersClient() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, statusFilter, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter }),
      });
      return fetch(`/api/admin/users?${params}`).then((r) => r.json());
    },
  });

  const mutation = useMutation({
    mutationFn: ({ id, action, role }: { id: string; action: string; role?: string }) =>
      fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, role }),
      }).then((r) => r.json()),
    onSuccess: (_, vars) => {
      toast.success(`Berhasil: ${vars.action}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setActiveMenu(null);
    },
    onError: () => toast.error("Gagal memproses"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("User dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setActiveMenu(null);
    },
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-500/20 text-green-400",
      SUSPENDED: "bg-yellow-500/20 text-yellow-400",
      BANNED: "bg-red-500/20 text-red-400",
    };
    const labels: Record<string, string> = { ACTIVE: "Aktif", SUSPENDED: "Disuspend", BANNED: "Dibanned" };
    return <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", colors[status])}>{labels[status]}</span>;
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      USER: "bg-gray-500/20 text-gray-400",
      ADMIN: "bg-blue-500/20 text-blue-400",
      SUPER_ADMIN: "bg-brand/20 text-brand",
    };
    const labels: Record<string, string> = { USER: "User", ADMIN: "Admin", SUPER_ADMIN: "Super Admin" };
    return <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", colors[role])}>{labels[role]}</span>;
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data?.total ?? 0} total pengguna terdaftar
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            placeholder="Cari nama, username, email..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field py-2 text-sm w-40"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="SUSPENDED">Disuspend</option>
          <option value="BANNED">Dibanned</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field py-2 text-sm w-40"
        >
          <option value="">Semua Role</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-300 bg-dark-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Pengguna</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400 hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400 hidden lg:table-cell">Post</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400 hidden lg:table-cell">Bergabung</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-brand mx-auto" />
                  </td>
                </tr>
              ) : (data?.users ?? []).map((user: any) => (
                <tr key={user.id} className="hover:bg-dark-200/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.profile?.avatar} name={user.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{roleBadge(user.role)}</td>
                  <td className="px-4 py-3">{statusBadge(user.status)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">{user._count.posts}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{formatRelativeTime(user.createdAt)}</td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg hover:bg-dark-400 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    {activeMenu === user.id && (
                      <div className="absolute right-4 top-10 w-48 card py-1 z-20 shadow-xl">
                        {user.status !== "SUSPENDED" && (
                          <button onClick={() => mutation.mutate({ id: user.id, action: "suspend" })}
                            className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-yellow-400">
                            <Shield className="w-4 h-4" /> Suspend
                          </button>
                        )}
                        {user.status !== "BANNED" && (
                          <button onClick={() => mutation.mutate({ id: user.id, action: "ban" })}
                            className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-red-400">
                            <Ban className="w-4 h-4" /> Ban
                          </button>
                        )}
                        {user.status !== "ACTIVE" && (
                          <button onClick={() => mutation.mutate({ id: user.id, action: "unban" })}
                            className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-green-400">
                            <RotateCcw className="w-4 h-4" /> Aktifkan
                          </button>
                        )}
                        {isSuperAdmin && user.role === "USER" && (
                          <button onClick={() => mutation.mutate({ id: user.id, action: "changeRole", role: "ADMIN" })}
                            className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-brand">
                            <Shield className="w-4 h-4" /> Jadikan Admin
                          </button>
                        )}
                        {isSuperAdmin && user.role === "ADMIN" && (
                          <button onClick={() => mutation.mutate({ id: user.id, action: "changeRole", role: "USER" })}
                            className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-gray-400">
                            <UserX className="w-4 h-4" /> Turunkan ke User
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button onClick={() => { if (confirm(`Hapus ${user.name}?`)) deleteMutation.mutate(user.id); }}
                            className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-dark-300 text-red-500">
                            <UserX className="w-4 h-4" /> Hapus Permanen
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-300">
            <p className="text-xs text-gray-500">
              Halaman {page} dari {data.totalPages} · {data.total} pengguna
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages}
                className="p-2 rounded-lg hover:bg-dark-300 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
