"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Sesuatu yang tidak terduga terjadi. Silakan coba lagi.
        </p>
      </div>
      <button onClick={reset} className="btn-primary px-6">
        Coba Lagi
      </button>
    </div>
  );
}
