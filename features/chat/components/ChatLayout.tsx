"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/utils/cn";
import { Send, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import { POLLING_INTERVAL } from "@/constants";

interface ChatLayoutProps { activeRoomId: string | null }

export function ChatLayout({ activeRoomId }: ChatLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Daftar room — polling 5 detik
  const { data: rooms } = useQuery({
    queryKey: ["chat-rooms"],
    queryFn: () => fetch("/api/chat/rooms").then((r) => r.json()),
    refetchInterval: POLLING_INTERVAL,
  });

  // Pesan dalam room — polling 5 detik
  const { data: msgData } = useQuery({
    queryKey: ["chat-messages", activeRoomId],
    queryFn: () => fetch(`/api/chat/rooms/${activeRoomId}/messages`).then((r) => r.json()),
    enabled: !!activeRoomId,
    refetchInterval: POLLING_INTERVAL,
  });

  const messages = msgData?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!message.trim() || !activeRoomId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/rooms/${activeRoomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message.trim() }),
      });
      if (!res.ok) throw new Error();
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", activeRoomId] });
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    } catch {
      toast.error("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const activeRoom = rooms?.find((r: any) => r.id === activeRoomId);
  const otherUser = activeRoom?.members?.[0]?.user;

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen">
      {/* Room List */}
      <div className={cn("w-full lg:w-80 xl:w-96 border-r border-dark-300 flex flex-col",
        activeRoomId ? "hidden lg:flex" : "flex")}>
        <div className="p-4 border-b border-dark-300">
          <h2 className="font-bold text-lg">Pesan</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!rooms ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-500" /></div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">Belum ada percakapan</div>
          ) : (
            rooms.map((room: any) => {
              const other = room.members?.[0]?.user;
              const lastMsg = room.messages?.[0];
              const isActive = room.id === activeRoomId;
              return (
                <button key={room.id} onClick={() => router.push(`/chat/${room.id}`)}
                  className={cn("w-full flex items-center gap-3 p-4 hover:bg-dark-200 transition-colors text-left",
                    isActive && "bg-dark-200")}>
                  <Avatar src={other?.profile?.avatar} name={other?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm truncate">{other?.name}</span>
                      {lastMsg && <span className="text-xs text-gray-500 shrink-0 ml-2">{formatRelativeTime(lastMsg.createdAt)}</span>}
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-gray-500 truncate">
                        {lastMsg.senderId === session?.user.id ? "Kamu: " : ""}{lastMsg.content ?? "📷 Media"}
                      </p>
                    )}
                  </div>
                  {room.unread > 0 && (
                    <span className="w-5 h-5 bg-brand rounded-full text-white text-xs flex items-center justify-center shrink-0">
                      {room.unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      {activeRoomId ? (
        <div className={cn("flex-1 flex flex-col", activeRoomId ? "flex" : "hidden lg:flex")}>
          {/* Header */}
          {otherUser && (
            <div className="flex items-center gap-3 p-4 border-b border-dark-300 glass sticky top-0">
              <button onClick={() => router.push("/chat")} className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-dark-300">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar src={otherUser.profile?.avatar} name={otherUser.name} size="sm" />
              <div>
                <p className="font-semibold text-sm">{otherUser.name}</p>
                <p className="text-xs text-gray-500">@{otherUser.username}</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg: any) => {
              const isMe = msg.sender.id === session?.user.id;
              return (
                <div key={msg.id} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                  {!isMe && <Avatar src={msg.sender.profile?.avatar} name={msg.sender.name} size="xs" />}
                  <div className={cn("max-w-[70%] rounded-2xl px-3 py-2 text-sm",
                    isMe ? "bg-brand text-white rounded-tr-sm" : "bg-dark-300 text-white rounded-tl-sm")}>
                    {msg.content}
                    <div className={cn("text-[10px] mt-1", isMe ? "text-brand-200" : "text-gray-500")}>
                      {formatRelativeTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-dark-300 glass">
            <div className="flex items-center gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                placeholder="Ketik pesan..."
                className="flex-1 bg-dark-200 border border-dark-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              />
              <button onClick={sendMessage} disabled={!message.trim() || sending}
                className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors disabled:opacity-40">
                {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-gray-500 flex-col gap-3">
          <p className="text-4xl">💬</p>
          <p>Pilih percakapan untuk mulai chat</p>
        </div>
      )}
    </div>
  );
}
