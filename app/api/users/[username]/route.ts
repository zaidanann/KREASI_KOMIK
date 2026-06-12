import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, name: true, username: true, role: true, status: true, createdAt: true,
      profile: true,
      _count: { select: { posts: true, followers: true, following: true } },
      followers: { where: { followerId: session.user.id }, select: { id: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  return NextResponse.json({
    ...user,
    isFollowing: user.followers.length > 0,
    isOwn: user.id === session.user.id,
    followers: undefined,
  });
}