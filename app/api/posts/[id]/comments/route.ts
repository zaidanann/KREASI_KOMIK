import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/validators/post";
import { PAGINATION } from "@/constants";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
    take: PAGINATION.COMMENT_LIMIT + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: {
      user: { select: { id: true, name: true, username: true, profile: { select: { avatar: true } } } },
      _count: { select: { replies: true } },
    },
  });

  const hasMore = comments.length > PAGINATION.COMMENT_LIMIT;
  const items = hasMore ? comments.slice(0, PAGINATION.COMMENT_LIMIT) : comments;
  return NextResponse.json({ comments: items, nextCursor: hasMore ? items[items.length - 1].id : null });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { postId: id, userId: session.user.id, content: parsed.data.content },
    include: {
      user: { select: { id: true, name: true, username: true, profile: { select: { avatar: true } } } },
      _count: { select: { replies: true } },
    },
  });

  const post = await prisma.post.findUnique({ where: { id }, select: { userId: true } });
  if (post && post.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        receiverId: post.userId,
        senderId: session.user.id,
        type: "COMMENT",
        message: `${session.user.name} mengomentari postinganmu`,
        postId: id,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}