import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileGrid } from "@/features/profile/components/ProfileGrid";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { name: true } });
  return { title: user ? `${user.name} (@${username})` : "Profil" };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      _count: { select: { posts: true, followers: true, following: true } },
      followers: session ? { where: { followerId: session.user.id }, select: { id: true } } : false,
    },
  });

  if (!user || user.status === "BANNED") notFound();

  const isFollowing = session ? (user.followers as any[]).length > 0 : false;
  const isOwn = session?.user.id === user.id;

  return (
    <div className="max-w-xl mx-auto">
      <ProfileHeader user={user} isFollowing={isFollowing} isOwn={isOwn} />
      <ProfileGrid username={username} />
    </div>
  );
}