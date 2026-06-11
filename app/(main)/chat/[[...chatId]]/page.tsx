import type { Metadata } from "next";
import { ChatLayout } from "@/features/chat/components/ChatLayout";

export const metadata: Metadata = { title: "Pesan" };

export default function ChatPage({ params }: { params: { chatId?: string[] } }) {
  const roomId = params.chatId?.[0] ?? null;
  return <ChatLayout activeRoomId={roomId} />;
}
