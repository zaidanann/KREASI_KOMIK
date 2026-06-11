import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET notifikasi user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: session.user.id,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      sender: {
        select: { id: true, name: true, username: true, profile: { select: { avatar: true } } },
      },
    },
  });

  const unreadCount = await prisma.notification.count({
    where: { receiverId: session.user.id, isRead: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH tandai semua notifikasi sebagai dibaca
export async function PATCH(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { receiverId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ message: "Semua notifikasi ditandai dibaca." });
}
