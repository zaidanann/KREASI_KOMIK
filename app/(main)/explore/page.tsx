import type { Metadata } from "next";
import { ExploreContent } from "@/features/search/components/ExploreContent";

export const metadata: Metadata = { title: "Jelajahi" };

export default function ExplorePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Jelajahi</h1>
      </div>
      <ExploreContent />
    </div>
  );
}
