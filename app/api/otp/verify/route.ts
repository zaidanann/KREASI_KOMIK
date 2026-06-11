import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`otp-verify:${ip}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Terlalu banyak percobaan." }, { status: 429 });
  }

  try {
    const { userId, otp } = await req.json();
    if (!userId || !otp) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    const success = await verifyOTP(userId, otp);
    if (!success) {
      return NextResponse.json({ error: "OTP salah atau sudah kedaluwarsa." }, { status: 400 });
    }

    return NextResponse.json({ message: "Email berhasil diverifikasi." });
  } catch (err) {
    console.error("[OTP_VERIFY_ERROR]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
