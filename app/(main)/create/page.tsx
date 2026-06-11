import type { Metadata } from "next";
import { CreatePostForm } from "@/features/post/components/CreatePostForm";

export const metadata: Metadata = { title: "Buat Postingan" };

export default function CreatePostPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Buat Postingan</h1>
      </div>
      <CreatePostForm />
    </div>
  );
}
