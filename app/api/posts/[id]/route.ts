import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteMedia } from "@/lib/cloudinary";

// GET /api/posts/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, username: true, profile: { select: { avatar: true } } } },
      media: { orderBy: { order: "asc" } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
      saves: { where: { userId: session.user.id }, select: { id: true } },
    },
  });

  if (!post) return NextResponse.json({ error: "Post tidak ditemukan." }, { status: 404 });

  return NextResponse.json({
    ...post,
    isLiked: post.likes.length > 0,
    isSaved: post.saves.length > 0,
    likes: undefined,
    saves: undefined,
  });
}

// PATCH /api/posts/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Post tidak ditemukan." }, { status: 404 });

  const canEdit =
    post.userId === session.user.id ||
    session.user.role === "ADMIN" ||
    session.user.role === "SUPER_ADMIN";
  if (!canEdit) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const { caption } = await req.json();
  const updated = await prisma.post.update({
    where: { id: params.id },
    data: { caption },
  });
  return NextResponse.json(updated);
}

// DELETE /api/posts/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { media: true },
  });
  if (!post) return NextResponse.json({ error: "Post tidak ditemukan." }, { status: 404 });

  const canDelete =
    post.userId === session.user.id ||
    session.user.role === "ADMIN" ||
    session.user.role === "SUPER_ADMIN";
  if (!canDelete) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  // Hapus media dari Cloudinary
  for (const m of post.media) {
    try {
      await deleteMedia(m.publicId, m.type === "VIDEO" ? "video" : "image");
    } catch { /* lanjut meski gagal hapus cloudinary */ }
  }

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Post berhasil dihapus." });
}
