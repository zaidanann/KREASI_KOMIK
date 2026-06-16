import { prisma } from "@/lib/prisma";
import { sendPushNotification, type PushPayload } from "@/lib/webpush";

/**
 * Panggil ini setelah prisma.notification.create()
 * untuk mengirim Web Push ke receiver.
 */
export async function triggerPushToUser(receiverId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: receiverId },
  });

  if (!subscriptions.length) return;

  const results = await Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  // Hapus subscription expired (410/404)
  const expiredEndpoints = subscriptions
    .filter((_, i) => results[i].expired)
    .map((s) => s.endpoint);

  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    });
  }
}
