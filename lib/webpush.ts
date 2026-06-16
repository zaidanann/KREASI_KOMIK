import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@joteng.app";

webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

export { webpush };

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
};

/**
 * Kirim push notification ke satu subscription
 */
export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (err: any) {
    // 410 = subscription expired / user unsubscribe
    if (err.statusCode === 410 || err.statusCode === 404) {
      return { success: false, expired: true };
    }
    console.error("[webpush] Error:", err);
    return { success: false, expired: false };
  }
}
