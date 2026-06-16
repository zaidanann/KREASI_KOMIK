"use client";

import { useNotifications } from "@/hooks/useNotifications";

/**
 * Komponen kosong — hanya untuk menjalankan useNotifications
 * di level global (di dalam Providers) agar polling & Web Push
 * aktif di seluruh halaman, bukan hanya halaman Notifikasi.
 */
export function NotificationInitializer() {
  useNotifications();
  return null;
}
