import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PostPageClient } from "@/features/post/components/PostPageClient";
import { APP_NAME } from "@/constants";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, username: true } },
      media: { take: 1, orderBy: { order: "asc" } },
    },
  });
  if (!post) return { title: "Post tidak ditemukan" };

  const title = `${post.user.name} di ${APP_NAME}`;
  const description = post.caption?.slice(0, 160) ?? "Lihat postingan ini di JOTENG";
  const image = post.media[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export default async function PostPage({ params }: Props) {
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true, name: true, username: true,
          profile: { select: { avatar: true } },
        },
      },
      media: { orderBy: { order: "asc" } },
      _count: { select: { likes: true, comments: true } },
      likes: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
      saves: session ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
  });

  if (!post) notFound();

  const enrichedPost = {
    ...post,
    isLiked: session ? (post.likes as any[]).length > 0 : false,
    isSaved: session ? (post.saves as any[]).length > 0 : false,
    likes: undefined,
    saves: undefined,
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Postingan</h1>
      </div>
      <PostPageClient post={enrichedPost as any} />
    </div>
  );
}
