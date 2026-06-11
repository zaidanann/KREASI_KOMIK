import type { Metadata } from "next";
import { Feed } from "@/features/feed/components/Feed";
import { CreatePostBar } from "@/features/post/components/CreatePostBar";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Beranda" };

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Beranda</h1>
      </div>
      <CreatePostBar user={session!.user} />
      <Feed />
    </div>
  );
}
