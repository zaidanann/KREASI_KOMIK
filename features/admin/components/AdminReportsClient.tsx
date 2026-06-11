"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Flag, CheckCircle, XCircle } from "lucide-react";
import { formatRelativeTime, cn } from "@/utils/cn";
import toast from "react-hot-toast";

const reasonLabels: Record<string, string> = {
  SPAM: "Spam",
  HARASSMENT: "Pelecehan",
  HATE_SPEECH: "Ujaran Kebencian",
  VIOLENCE: "Kekerasan",
  NUDITY: "Konten Dewasa",
  MISINFORMATION: "Misinformasi",
  OTHER: "Lainnya",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  REVIEWED: "bg-blue-500/20 text-blue-400",
  RESOLVED: "bg-green-500/20 text-green-400",
  DISMISSED: "bg-gray-500/20 text-gray-400",
};

export function AdminReportsClient() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", status, page],
    queryFn: () =>
      fetch(`/api/admin/reports?status=${status}&page=${page}`).then((r) => r.json()),
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      toast.success("Status laporan diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-gray-500 text-sm mt-1">Tinjau dan tangani laporan dari pengguna</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              status === s ? "bg-brand text-white" : "bg-dark-200 text-gray-400 hover:text-white"
            )}
          >
            {{
              PENDING: "Menunggu",
              REVIEWED: "Ditinjau",
              RESOLVED: "Diselesaikan",
              DISMISSED: "Diabaikan",
            }[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
        </div>
      ) : (data?.reports ?? []).length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          <Flag className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          <p>Tidak ada laporan dengan status ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.reports ?? []).map((r: any) => (
            <div key={r.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                      {reasonLabels[r.reason]}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[r.status])}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Dilaporkan oleh{" "}
                    <span className="text-white font-medium">@{r.reporter?.username}</span>
                    {" · "}
                    {formatRelativeTime(r.createdAt)}
                  </p>
                  {r.description && (
                    <p className="text-sm text-gray-300 italic">"{r.description}"</p>
                  )}
                </div>

                {r.status === "PENDING" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => mutation.mutate({ id: r.id, action: "resolve" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Selesaikan
                    </button>
                    <button
                      onClick={() => mutation.mutate({ id: r.id, action: "dismiss" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 text-xs font-medium transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Abaikan
                    </button>
                  </div>
                )}
              </div>

              {/* Post preview */}
              {r.post && (
                <div className="bg-dark-300 rounded-xl p-3 text-sm">
                  <p className="text-xs text-gray-500 mb-1">
                    Post oleh <span className="text-white">@{r.post.user?.username}</span>
                  </p>
                  <p className="text-gray-300 line-clamp-2">{r.post.caption ?? "(tidak ada caption)"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
