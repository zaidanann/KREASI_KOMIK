import type { Metadata } from "next";
import { ChatLayout } from "@/features/chat/components/ChatLayout";

export const metadata: Metadata = { title: "Pesan" };

export default async function ChatPage({ params }: { params: Promise<{ chatId?: string[] }> }) {
  const { chatId } = await params;
  const roomId = chatId?.[0] ?? null;
  return <ChatLayout activeRoomId={roomId} />;
}