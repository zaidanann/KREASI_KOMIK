import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Upload gambar ke Cloudinary
export async function uploadImage(
  file: string, // base64 atau URL
  folder: string = "joteng/posts"
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

// Upload video ke Cloudinary
export async function uploadVideo(
  file: string,
  folder: string = "joteng/videos"
): Promise<{ url: string; publicId: string; duration: number }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "video",
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration ?? 0,
  };
}

// Hapus file dari Cloudinary
export async function deleteMedia(publicId: string, resourceType: "image" | "video" = "image") {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
