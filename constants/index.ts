export const APP_NAME = "JOTENG";
export const APP_DESCRIPTION = "Platform Sosial Media Modern — Berbagi Momen, Terhubung Bersama";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  EXPLORE: "/explore",
  BOOKMARKS: "/bookmarks",
  NOTIFICATIONS: "/notifications",
  CREATE_POST: "/create",
  CHAT: "/chat",
  SETTINGS: "/settings",
  ADMIN: "/admin",
  SUPER_ADMIN: "/super-admin",
  PROFILE: (username: string) => `/profile/${username}`,
  POST: (id: string) => `/post/${id}`,
} as const;

export const PROTECTED_ROUTES = ["/", "/explore", "/bookmarks", "/notifications", "/create", "/chat", "/settings", "/profile"];
export const ADMIN_ROUTES = ["/admin"];
export const SUPER_ADMIN_ROUTES = ["/super-admin"];
export const AUTH_ROUTES = ["/login", "/register", "/verify-otp"];

export const PAGINATION = {
  FEED_LIMIT: 10,
  COMMENT_LIMIT: 20,
  CHAT_LIMIT: 30,
  SEARCH_LIMIT: 20,
  ADMIN_TABLE_LIMIT: 20,
} as const;

export const UPLOAD_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGES_PER_POST: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
} as const;

export const POLLING_INTERVAL = 5000; // 5 detik untuk chat & notifikasi
