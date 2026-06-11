import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/constants";

// GET pesan dalam room
export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Pastikan user adalah member room
  const member = await prisma.chatRoomMember.findUnique({
    where: { chatRoomId_userId: { chatRoomId: params.roomId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const messages = await prisma.message.findMany({
    where: { chatRoomId: params.roomId },
    orderBy: { createdAt: "desc" },
    take: PAGINATION.CHAT_LIMIT + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: {
      sender: {
        select: { id: true, name: true, username: true, profile: { select: { avatar: true } } },
      },
    },
  });

  // Update lastReadAt
  await prisma.chatRoomMember.update({
    where: { chatRoomId_userId: { chatRoomId: params.roomId, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });

  const hasMore = messages.length > PAGINATION.CHAT_LIMIT;
  const items = hasMore ? messages.slice(0, PAGINATION.CHAT_LIMIT) : messages;

  return NextResponse.json({
    messages: items.reverse(), // urutkan dari lama ke baru
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}

// POST kirim pesan
export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.chatRoomMember.findUnique({
    where: { chatRoomId_userId: { chatRoomId: params.roomId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const { content, mediaUrl, mediaType } = await req.json();
  if (!content && !mediaUrl) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      chatRoomId: params.roomId,
      senderId: session.user.id,
      content,
      mediaUrl,
      mediaType,
    },
    include: {
      sender: {
        select: { id: true, name: true, username: true, profile: { select: { avatar: true } } },
      },
    },
  });

  // Update updatedAt room
  await prisma.chatRoom.update({
    where: { id: params.roomId },
    data: { updatedAt: new Date() },
  });

  // Notifikasi penerima
  const otherMembers = await prisma.chatRoomMember.findMany({
    where: { chatRoomId: params.roomId, userId: { not: session.user.id } },
  });
  for (const m of otherMembers) {
    await prisma.notification.create({
      data: {
        receiverId: m.userId,
        senderId: session.user.id,
        type: "MESSAGE",
        message: `${session.user.name} mengirim pesan`,
      },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
