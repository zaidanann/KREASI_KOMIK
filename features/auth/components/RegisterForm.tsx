"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/validators/auth";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Pendaftaran gagal.");
        return;
      }

      toast.success("Akun dibuat! Cek email untuk kode OTP.");
      router.push(`/verify-otp?userId=${json.userId}`);
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: "name" as const,            label: "Nama Lengkap", type: "text",     placeholder: "Nama kamu" },
    { name: "username" as const,        label: "Username",     type: "text",     placeholder: "username_kamu" },
    { name: "email" as const,           label: "Email",        type: "email",    placeholder: "kamu@contoh.com" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map(({ name, label, type, placeholder }) => (
        <div key={name} className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <input
            {...register(name)}
            type={type}
            placeholder={placeholder}
            className="input-field"
          />
          {errors[name] && (
            <p className="text-red-400 text-xs">{errors[name]?.message}</p>
          )}
        </div>
      ))}

      {/* Password */}
      {(["password", "confirmPassword"] as const).map((field) => {
        const isConfirm = field === "confirmPassword";
        const show = isConfirm ? showConfirm : showPassword;
        const setShow = isConfirm ? setShowConfirm : setShowPassword;
        return (
          <div key={field} className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">
              {isConfirm ? "Konfirmasi Password" : "Password"}
            </label>
            <div className="relative">
              <input
                {...register(field)}
                type={show ? "text" : "password"}
                placeholder={isConfirm ? "Ulangi password" : "Min. 8 karakter"}
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
            {errors[field] && (
              <p className="text-red-400 text-xs">{errors[field]?.message}</p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Mendaftar..." : "Buat Akun"}
      </button>
    </form>
  );
}
