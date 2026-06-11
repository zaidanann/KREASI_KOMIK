import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center">
        <Zap className="w-8 h-8 text-brand" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-black text-gradient">404</h1>
        <p className="text-xl font-bold">Halaman Tidak Ditemukan</p>
        <p className="text-gray-500 text-sm max-w-sm">
          Halaman yang kamu cari tidak ada atau telah dipindahkan.
        </p>
      </div>
      <Link href="/" className="btn-primary px-6">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
