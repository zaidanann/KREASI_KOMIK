import { prisma } from "@/lib/prisma";

// Generate OTP 6 digit
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simpan OTP ke database (expired 5 menit)
export async function saveOTP(userId: string, otp: string) {
  // Hapus OTP lama yang belum dipakai
  await prisma.verificationCode.deleteMany({
    where: { userId, isUsed: false },
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

  return prisma.verificationCode.create({
    data: { userId, code: otp, expiresAt },
  });
}

// Verifikasi OTP
export async function verifyOTP(userId: string, otp: string): Promise<boolean> {
  const record = await prisma.verificationCode.findFirst({
    where: {
      userId,
      code: otp,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return false;

  // Tandai OTP sebagai sudah digunakan
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  // Tandai email sebagai terverifikasi
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  return true;
}
