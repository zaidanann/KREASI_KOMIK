import type { Metadata } from "next";
import { BookmarksFeed } from "@/features/feed/components/BookmarksFeed";

export const metadata: Metadata = { title: "Tersimpan" };

export default function BookmarksPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Tersimpan</h1>
      </div>
      <BookmarksFeed />
    </div>
  );
}
