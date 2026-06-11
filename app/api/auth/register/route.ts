import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateOTP, saveOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/nodemailer";
import { registerSchema } from "@/validators/auth";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrasi per IP per menit
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`register:${ip}`, 5, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, username, email, password } = parsed.data;

    // Cek email duplikat
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 400 });
    }

    // Cek username duplikat
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username sudah digunakan." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user + profile
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        profile: { create: {} },
      },
    });

    // Generate & simpan OTP
    const otp = generateOTP();
    await saveOTP(user.id, otp);

    // Kirim OTP ke email
    await sendOTPEmail(email, name, otp);

    return NextResponse.json({ userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("[REGISTER_ERROR]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
