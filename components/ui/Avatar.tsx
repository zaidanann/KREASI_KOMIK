import { cn } from "@/utils/cn";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-2xl",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center font-bold text-white",
        // ^^^^^^^^ tambahkan "relative" di sini
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? "avatar"}
          fill
          className="object-cover"
          sizes="96px"
        />
        // hapus style={{ position: "absolute" }} karena sudah handled oleh fill
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
