"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Activity } from "lucide-react";
import { formatRelativeTime } from "@/utils/cn";

export function ActivityLogClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-log"],
    queryFn: () => fetch("/api/admin/activity").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Log Aktivitas</h1>
        <p className="text-gray-500 text-sm mt-1">Semua aktivitas admin di platform KREASI</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-brand" />
        </div>
      ) : (data?.logs ?? []).length === 0 ? (
        <div className="card p-10 text-center text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          <p>Belum ada aktivitas tercatat</p>
        </div>
      ) : (
        <div className="card divide-y divide-dark-300">
          {(data?.logs ?? []).map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{log.user?.name ?? "System"}</span>
                  <span className="text-gray-400"> · {log.action}</span>
                  {log.entity && (
                    <span className="text-gray-500"> pada {log.entity}</span>
                  )}
                </p>
                <p className="text-xs text-gray-600">{formatRelativeTime(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
