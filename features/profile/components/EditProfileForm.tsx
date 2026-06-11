"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { updateProfileSchema, type UpdateProfileInput } from "@/validators/profile";
import toast from "react-hot-toast";
import { Camera, Loader2 } from "lucide-react";

export function EditProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar ?? null);
  const [coverUrl, setCoverUrl] = useState(user?.profile?.cover ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
      bio: user?.profile?.bio ?? "",
      website: user?.profile?.website ?? "",
      location: user?.profile?.location ?? "",
    },
  });

  const uploadFile = async (file: File, type: "avatar" | "cover") => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error("Gagal upload gambar"); return null; }

      // Simpan ke profile
      await fetch("/api/users/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: data.url }),
      });

      return data.url;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Gagal menyimpan"); return; }
      toast.success("Profil berhasil diperbarui!");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cover */}
      <div className="relative h-32 bg-gradient-to-br from-brand/30 to-purple-900/30 rounded-xl overflow-hidden cursor-pointer"
        onClick={() => coverRef.current?.click()}>
        {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) { const url = await uploadFile(f, "cover"); if (url) setCoverUrl(url); }
          }} />
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer" onClick={() => avatarRef.current?.click()}>
          <Avatar src={avatarUrl} name={user?.name} size="lg" />
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) { const url = await uploadFile(f, "avatar"); if (url) setAvatarUrl(url); }
            }} />
        </div>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-500">Klik avatar untuk mengubah foto profil</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          { name: "name" as const,     label: "Nama Lengkap", placeholder: "Nama kamu" },
          { name: "username" as const, label: "Username",     placeholder: "username_kamu" },
          { name: "website" as const,  label: "Website",      placeholder: "https://website.com" },
          { name: "location" as const, label: "Lokasi",       placeholder: "Jakarta, Indonesia" },
        ].map(({ name, label, placeholder }) => (
          <div key={name} className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <input {...register(name)} placeholder={placeholder} className="input-field" />
            {errors[name] && <p className="text-red-400 text-xs">{errors[name]?.message}</p>}
          </div>
        ))}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Bio</label>
          <textarea {...register("bio")} placeholder="Cerita tentang dirimu..." rows={3}
            className="input-field resize-none" maxLength={160} />
          {errors.bio && <p className="text-red-400 text-xs">{errors.bio.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting || isUploading} className="btn-primary w-full flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
