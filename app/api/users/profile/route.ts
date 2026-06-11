import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/validators/profile";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, username, bio, website, location } = parsed.data;

  // Cek username tidak bentrok dengan user lain
  if (username !== session.user.username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ error: "Username sudah digunakan." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, username },
  });

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { bio, website: website || null, location },
    create: { userId: session.user.id, bio, website: website || null, location },
  });

  return NextResponse.json({ message: "Profil berhasil diperbarui." });
}
