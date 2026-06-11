import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET daftar chat room user
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await prisma.chatRoom.findMany({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      members: {
        where: { userId: { not: session.user.id } },
        include: {
          user: {
            select: { id: true, name: true, username: true, profile: { select: { avatar: true } } },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  // Hitung unread per room
  const roomsWithUnread = await Promise.all(
    rooms.map(async (room) => {
      const member = await prisma.chatRoomMember.findUnique({
        where: { chatRoomId_userId: { chatRoomId: room.id, userId: session.user.id } },
      });
      const unread = await prisma.message.count({
        where: {
          chatRoomId: room.id,
          senderId: { not: session.user.id },
          createdAt: { gt: member?.lastReadAt ?? new Date(0) },
        },
      });
      return { ...room, unread };
    })
  );

  return NextResponse.json(roomsWithUnread);
}

// POST buat atau temukan room chat 1-on-1
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "targetUserId diperlukan." }, { status: 400 });

  // Cek apakah room sudah ada
  const existing = await prisma.chatRoom.findFirst({
    where: {
      AND: [
        { members: { some: { userId: session.user.id } } },
        { members: { some: { userId: targetUserId } } },
      ],
    },
  });

  if (existing) return NextResponse.json(existing);

  // Buat room baru
  const room = await prisma.chatRoom.create({
    data: {
      members: {
        create: [{ userId: session.user.id }, { userId: targetUserId }],
      },
    },
  });

  return NextResponse.json(room, { status: 201 });
}
