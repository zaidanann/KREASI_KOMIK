import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = params.id;
  const userId = session.user.id;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    // Unlike
    await prisma.like.delete({ where: { postId_userId: { postId, userId } } });
    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: false, count });
  } else {
    // Like
    await prisma.like.create({ data: { postId, userId } });

    // Buat notifikasi ke pemilik post (kecuali like sendiri)
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
    if (post && post.userId !== userId) {
      await prisma.notification.create({
        data: {
          receiverId: post.userId,
          senderId: userId,
          type: "LIKE",
          message: `${session.user.name} menyukai postinganmu`,
          postId,
        },
      });
    }

    const count = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: true, count });
  }
}
