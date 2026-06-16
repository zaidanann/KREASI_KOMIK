import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triggerPushToUser } from "@/lib/triggerPush";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "targetUserId diperlukan" }, { status: 400 });
  if (targetUserId === session.user.id) return NextResponse.json({ error: "Tidak bisa follow diri sendiri" }, { status: 400 });

  const followerId = session.user.id;

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId: targetUserId } },
    });
    const count = await prisma.follow.count({ where: { followingId: targetUserId } });
    return NextResponse.json({ following: false, followerCount: count });
  } else {
    await prisma.follow.create({ data: { followerId, followingId: targetUserId } });

    // Notifikasi
    await prisma.notification.create({
      data: {
        receiverId: targetUserId,
        senderId: followerId,
        type: "FOLLOW",
        message: `${session.user.name} mulai mengikutimu`,
      },
    });
    // Kirim Web Push
    triggerPushToUser(targetUserId, {
      title: "👤 JOTENG",
      body: `${session.user.name} mulai mengikutimu`,
      url: `/profile/${session.user.username}`,
      tag: `follow-${followerId}`,
    });

    const count = await prisma.follow.count({ where: { followingId: targetUserId } });
    return NextResponse.json({ following: true, followerCount: count });
  }
}
