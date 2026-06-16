import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification, type PushPayload } from "@/lib/webpush";

// POST — kirim push notification ke user tertentu
// Dipanggil secara internal dari API like/comment/follow/chat
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: { receiverId: string; payload: PushPayload } = await req.json();
  const { receiverId, payload } = body;

  if (!receiverId || !payload) {
    return NextResponse.json({ error: "Missing receiverId or payload" }, { status: 400 });
  }

  // Ambil semua subscription milik receiver
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: receiverId },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const results = await Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  // Hapus subscription yang sudah expired
  const expiredEndpoints = subscriptions
    .filter((_, i) => results[i].expired)
    .map((s) => s.endpoint);

  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    });
  }

  const sent = results.filter((r) => r.success).length;
  return NextResponse.json({ sent });
}
