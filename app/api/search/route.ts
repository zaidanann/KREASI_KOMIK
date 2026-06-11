import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ users: [], posts: [] });

  const [users, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: { id: true, name: true, username: true, profile: { select: { avatar: true } } },
    }),
    prisma.post.findMany({
      where: {
        isSensored: false,
        caption: { contains: q, mode: "insensitive" },
      },
      take: 9,
      orderBy: { createdAt: "desc" },
      include: { media: { take: 1, orderBy: { order: "asc" } } },
    }),
  ]);

  return NextResponse.json({ users, posts });
}
