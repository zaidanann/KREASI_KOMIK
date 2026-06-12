import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/constants";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: PAGINATION.FEED_LIMIT + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: {
      media: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const hasMore = posts.length > PAGINATION.FEED_LIMIT;
  const items = hasMore ? posts.slice(0, PAGINATION.FEED_LIMIT) : posts;
  return NextResponse.json({ posts: items, nextCursor: hasMore ? items[items.length - 1].id : null });
}