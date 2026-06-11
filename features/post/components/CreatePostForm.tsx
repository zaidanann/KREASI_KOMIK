"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { Image as ImageIcon, Video, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { UPLOAD_LIMITS } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";

interface UploadedMedia {
  url: string;
  publicId: string;
  type: "IMAGE" | "VIDEO";
  width?: number;
  height?: number;
  duration?: number;
  order: number;
  preview: string;
}

export function CreatePostForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = UPLOAD_LIMITS.MAX_IMAGES_PER_POST - mediaList.length;
    if (remaining <= 0) { toast.error(`Maksimal ${UPLOAD_LIMITS.MAX_IMAGES_PER_POST} media`); return; }

    setIsUploading(true);
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) { toast.error(`${file.name}: tipe tidak didukung`); continue; }
        if (isImage && file.size > UPLOAD_LIMITS.MAX_IMAGE_SIZE) { toast.error(`${file.name}: gambar maks 10MB`); continue; }
        if (isVideo && file.size > UPLOAD_LIMITS.MAX_VIDEO_SIZE) { toast.error(`${file.name}: video maks 100MB`); continue; }

        const preview = URL.createObjectURL(file);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "post");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) { toast.error(`Gagal upload ${file.name}`); continue; }
        const data = await res.json();

        setMediaList((prev) => [
          ...prev,
          { ...data, preview, order: prev.length },
        ]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i })));
  };

  const handleSubmit = async () => {
    if (!caption.trim() && mediaList.length === 0) {
      toast.error("Tulis sesuatu atau tambahkan media");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim(),
          mediaUrls: mediaList.map(({ preview, ...m }) => m),
        }),
      });

      if (!res.ok) { toast.error("Gagal membuat postingan"); return; }

      toast.success("Postingan berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* User + Textarea */}
      <div className="flex gap-3">
        <Avatar src={session?.user.image} name={session?.user.name} size="md" />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Apa yang kamu pikirkan?"
          maxLength={2200}
          rows={4}
          className="flex-1 bg-transparent text-base outline-none resize-none placeholder-gray-600 leading-relaxed"
        />
      </div>

      {/* Media Preview */}
      {mediaList.length > 0 && (
        <div className={`grid gap-2 ${mediaList.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {mediaList.map((m, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-dark-300">
              {m.type === "VIDEO" ? (
                <video src={m.preview} className="w-full h-full object-cover" />
              ) : (
                <img src={m.preview} alt="" className="w-full h-full object-cover" />
              )}
              <button onClick={() => removeMedia(i)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Mengupload...
        </div>
      )}

      <div className="text-xs text-gray-600 text-right">{caption.length}/2200</div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-dark-300">
        <div className="flex items-center gap-1">
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} disabled={isUploading || mediaList.length >= 10}
            className="p-2.5 rounded-xl hover:bg-dark-200 text-brand transition-colors disabled:opacity-40">
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting || isUploading || (!caption.trim() && mediaList.length === 0)}
          className="btn-primary px-6 flex items-center gap-2">
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
