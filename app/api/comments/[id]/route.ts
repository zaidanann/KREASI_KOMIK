import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan." }, { status: 404 });

  const canDelete =
    comment.userId === session.user.id ||
    session.user.role === "ADMIN" ||
    session.user.role === "SUPER_ADMIN";

  if (!canDelete) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Komentar dihapus." });
}
