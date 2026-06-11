import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/validators/post";

// GET replies
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const replies = await prisma.replyComment.findMany({
    where: { commentId: params.id },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, username: true, profile: { select: { avatar: true } } },
      },
    },
  });

  return NextResponse.json(replies);
}

// POST add reply
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const reply = await prisma.replyComment.create({
    data: {
      commentId: params.id,
      userId: session.user.id,
      content: parsed.data.content,
    },
    include: {
      user: {
        select: { id: true, name: true, username: true, profile: { select: { avatar: true } } },
      },
    },
  });

  // Notifikasi pemilik komentar
  const comment = await prisma.comment.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });
  if (comment && comment.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        receiverId: comment.userId,
        senderId: session.user.id,
        type: "REPLY",
        message: `${session.user.name} membalas komentarmu`,
      },
    });
  }

  return NextResponse.json(reply, { status: 201 });
}
