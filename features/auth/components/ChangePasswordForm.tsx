"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { changePasswordSchema, type ChangePasswordInput } from "@/validators/auth";

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Gagal mengubah password"); return; }
      toast.success("Password berhasil diubah!");
      reset();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: "currentPassword" as const, label: "Password Saat Ini", show: showCurrent, setShow: setShowCurrent },
    { name: "newPassword" as const,     label: "Password Baru",      show: showNew,     setShow: setShowNew },
    { name: "confirmNewPassword" as const, label: "Konfirmasi Password Baru", show: showConfirm, setShow: setShowConfirm },
  ];

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h2 className="font-bold">Ubah Password</h2>
          <p className="text-xs text-gray-500">Pastikan gunakan password yang kuat</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map(({ name, label, show, setShow }) => (
          <div key={name} className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <div className="relative">
              <input
                {...register(name)}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors[name] && <p className="text-red-400 text-xs">{errors[name]?.message}</p>}
          </div>
        ))}

        <div className="bg-dark-300 rounded-xl p-3 text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">Syarat password kuat:</p>
          <p>• Minimal 8 karakter</p>
          <p>• Mengandung huruf kapital (A-Z)</p>
          <p>• Mengandung angka (0-9)</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Menyimpan..." : "Ubah Password"}
        </button>
      </form>
    </div>
  );
}
