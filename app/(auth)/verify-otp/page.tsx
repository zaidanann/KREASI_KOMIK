import type { Metadata } from "next";
import { OTPForm } from "@/features/auth/components/OTPForm";

export const metadata: Metadata = { title: "Verifikasi Email" };

export default function VerifyOTPPage() {
  return (
    <div className="card p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center mx-auto">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold">Verifikasi Email</h1>
        <p className="text-gray-500 text-sm">
          Kami telah mengirim kode OTP 6 digit ke emailmu.
          <br />
          Kode berlaku selama <span className="text-brand font-semibold">5 menit</span>.
        </p>
      </div>
      <OTPForm />
    </div>
  );
}
