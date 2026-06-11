import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, uploadVideo } from "@/lib/cloudinary";
import { UPLOAD_LIMITS } from "@/constants";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "post" | "avatar" | "cover"

    if (!file) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json({ error: "Tipe file tidak didukung." }, { status: 400 });
    }

    // Validasi ukuran
    if (isImage && file.size > UPLOAD_LIMITS.MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Ukuran gambar maks 10MB." }, { status: 400 });
    }
    if (isVideo && file.size > UPLOAD_LIMITS.MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "Ukuran video maks 100MB." }, { status: 400 });
    }

    // Convert ke base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const folder =
      type === "avatar" ? "joteng/avatars"
      : type === "cover" ? "joteng/covers"
      : isVideo ? "joteng/videos"
      : "joteng/posts";

    let result;
    if (isVideo) {
      result = await uploadVideo(base64, folder);
      return NextResponse.json({ ...result, type: "VIDEO" });
    } else {
      result = await uploadImage(base64, folder);
      return NextResponse.json({ ...result, type: "IMAGE" });
    }
  } catch (err) {
    console.error("[UPLOAD_ERROR]", err);
    return NextResponse.json({ error: "Gagal mengupload file." }, { status: 500 });
  }
}
