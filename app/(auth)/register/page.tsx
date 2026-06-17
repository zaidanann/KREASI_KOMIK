import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun KREASI baru",
};

export default function RegisterPage() {
  return (
    <div className="card p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Buat Akun Baru</h1>
        <p className="text-gray-500 text-sm">Bergabung dengan komunitas JOTENG</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-brand hover:text-brand-400 font-semibold">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
