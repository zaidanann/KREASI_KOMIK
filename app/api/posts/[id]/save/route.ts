import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const existing = await prisma.savedPost.findUnique({ where: { postId_userId: { postId, userId } } });

  if (existing) {
    await prisma.savedPost.delete({ where: { postId_userId: { postId, userId } } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedPost.create({ data: { postId, userId } });
    return NextResponse.json({ saved: true });
  }
}