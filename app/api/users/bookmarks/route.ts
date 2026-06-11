import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/constants";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const saved = await prisma.savedPost.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: PAGINATION.FEED_LIMIT + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: {
      post: {
        include: {
          user: { select: { id: true, name: true, username: true, profile: { select: { avatar: true } } } },
          media: { orderBy: { order: "asc" } },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: session.user.id }, select: { id: true } },
          saves: { where: { userId: session.user.id }, select: { id: true } },
        },
      },
    },
  });

  const hasMore = saved.length > PAGINATION.FEED_LIMIT;
  const items = hasMore ? saved.slice(0, PAGINATION.FEED_LIMIT) : saved;
  const posts = items.map((s) => ({
    ...s.post,
    isLiked: s.post.likes.length > 0,
    isSaved: true,
    likes: undefined,
    saves: undefined,
  }));

  return NextResponse.json({ posts, nextCursor: hasMore ? items[items.length - 1].id : null });
}
