import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { isSensored: false },
    orderBy: { likes: { _count: "desc" } },
    take: 18,
    include: {
      media: { take: 1, orderBy: { order: "asc" } },
      _count: { select: { likes: true } },
    },
  });

  return NextResponse.json({ posts });
}
