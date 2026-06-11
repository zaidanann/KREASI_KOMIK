import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, saveOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/nodemailer";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`otp-resend:${ip}`, 3, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Terlalu banyak permintaan OTP." }, { status: 429 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "User ID diperlukan." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ error: "Email sudah terverifikasi." }, { status: 400 });

    const otp = generateOTP();
    await saveOTP(user.id, otp);
    await sendOTPEmail(user.email, user.name, otp);

    return NextResponse.json({ message: "OTP baru telah dikirim." });
  } catch (err) {
    console.error("[OTP_RESEND_ERROR]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
