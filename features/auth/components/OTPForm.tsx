"use client";

import { useRef, useState, KeyboardEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function OTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length < 6) { toast.error("Masukkan 6 digit OTP"); return; }
    if (!userId) { toast.error("User ID tidak ditemukan"); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "OTP salah atau sudah kedaluwarsa"); return; }
      toast.success("Email berhasil diverifikasi! Silakan login.");
      router.push("/login");
    } catch {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Gagal mengirim ulang"); return; }
      toast.success("OTP baru telah dikirim ke emailmu");
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
    } catch {
      toast.error("Gagal mengirim ulang OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OTP Input Boxes */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold bg-dark-200 border-2
                       border-dark-400 rounded-xl text-white focus:outline-none
                       focus:border-brand transition-colors"
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || digits.join("").length < 6}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Memverifikasi..." : "Verifikasi"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Tidak menerima kode?{" "}
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-brand hover:text-brand-400 font-semibold disabled:opacity-50"
        >
          {isResending ? "Mengirim..." : "Kirim Ulang"}
        </button>
      </p>
    </div>
  );
}
