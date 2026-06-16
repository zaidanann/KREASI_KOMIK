"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { triggerNotificationToast, type ToastNotification } from "@/components/ui/NotificationToast";
import { POLLING_INTERVAL } from "@/constants";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

// Konversi VAPID key ke Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function useNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const prevUnreadRef = useRef<number | null>(null);
  const prevNotifIdsRef = useRef<Set<string>>(new Set());
  const pushRegisteredRef = useRef(false);

  // ── Polling notifikasi (tetap ada sebagai fallback) ──────────
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: POLLING_INTERVAL,
    enabled: !!session,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount: number = data?.unreadCount ?? 0;

  // ── Deteksi notifikasi baru → tampilkan toast ─────────────
  useEffect(() => {
    if (!notifications.length) return;

    const currentIds = new Set<string>(notifications.map((n: any) => n.id));

    // Skip run pertama (set baseline)
    if (prevNotifIdsRef.current.size === 0) {
      prevNotifIdsRef.current = currentIds;
      prevUnreadRef.current = unreadCount;
      return;
    }

    // Cari notif yang belum ada sebelumnya
    const newNotifs = notifications.filter(
      (n: any) => !prevNotifIdsRef.current.has(n.id) && !n.isRead
    );

    newNotifs.forEach((n: any) => {
      const toast: ToastNotification = {
        id: n.id,
        type: n.type,
        senderName: n.sender?.name ?? "Seseorang",
        senderUsername: n.sender?.username ?? "",
        senderAvatar: n.sender?.profile?.avatar,
        message: n.message,
        url: n.postId ? `/post/${n.postId}` : n.type === "FOLLOW" ? `/profile/${n.sender?.username}` : undefined,
      };
      triggerNotificationToast(toast);
    });

    prevNotifIdsRef.current = currentIds;
    prevUnreadRef.current = unreadCount;
  }, [notifications, unreadCount]);

  // ── Daftarkan Service Worker & Web Push ──────────────────
  const registerPush = useCallback(async () => {
    if (!session || pushRegisteredRef.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    try {
      // Daftarkan SW
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Cek permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // Cek apakah sudah subscribe
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // Kirim subscription ke server
      const subJson = subscription.toJSON();
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      pushRegisteredRef.current = true;
    } catch (err) {
      console.error("[Push] Gagal registrasi:", err);
    }
  }, [session]);

  useEffect(() => {
    registerPush();
  }, [registerPush]);

  return { unreadCount, notifications };
}
