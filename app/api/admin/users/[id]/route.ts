import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, role } = await req.json();
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  if (session.user.role === "ADMIN" && (targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const updateData: Partial<{ status: string; role: string }> = {};

  switch (action) {
    case "suspend": updateData.status = "SUSPENDED"; break;
    case "ban":     updateData.status = "BANNED"; break;
    case "unban":   updateData.status = "ACTIVE"; break;
    case "changeRole":
      if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Hanya super admin." }, { status: 403 });
      if (!["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
      updateData.role = role;
      break;
    default: return NextResponse.json({ error: "Action tidak dikenal." }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id }, data: updateData });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: `${action} user`,
      entity: "User",
      entityId: id,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Hanya super admin." }, { status: 403 });
  }

  if (id === session.user.id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  await prisma.activityLog.create({
    data: { userId: session.user.id, action: "delete user", entity: "User", entityId: id },
  });

  return NextResponse.json({ message: "User berhasil dihapus." });
}