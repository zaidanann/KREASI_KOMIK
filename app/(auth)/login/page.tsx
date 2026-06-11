import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun JOTENG kamu",
};

export default function LoginPage() {
  return (
    <div className="card p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Selamat Datang Kembali</h1>
        <p className="text-gray-500 text-sm">Masuk untuk melanjutkan ke JOTENG</p>
      </div>
      <LoginForm />
    </div>
  );
}
