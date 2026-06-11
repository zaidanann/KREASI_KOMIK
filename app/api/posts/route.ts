import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/validators/post";
import { PAGINATION } from "@/constants";

// GET /api/posts — ambil feed
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = PAGINATION.FEED_LIMIT;

  const posts = await prisma.post.findMany({
    where: { isSensored: false },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    include: {
      user: {
        select: {
          id: true, name: true, username: true,
          profile: { select: { avatar: true } },
        },
      },
      media: { orderBy: { order: "asc" } },
      _count: { select: { likes: true, comments: true } },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      saves: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  const formatted = items.map((p) => ({
    ...p,
    isLiked: p.likes.length > 0,
    isSaved: p.saves.length > 0,
    likes: undefined,
    saves: undefined,
  }));

  return NextResponse.json({ posts: formatted, nextCursor });
}

// POST /api/posts — buat postingan baru
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { caption, mediaUrls } = parsed.data;

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        caption,
        media: {
          create: mediaUrls.map((m) => ({
            url: m.url,
            publicId: m.publicId,
            type: m.type,
            width: m.width,
            height: m.height,
            duration: m.duration,
            order: m.order,
          })),
        },
      },
      include: {
        media: true,
        user: { select: { id: true, name: true, username: true, profile: { select: { avatar: true } } } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[CREATE_POST_ERROR]", err);
    return NextResponse.json({ error: "Gagal membuat postingan." }, { status: 500 });
  }
}
