import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Users } from "lucide-react";

export async function RightSidebar() {
  const session = await auth();

  // Ambil saran akun (user terbaru yang belum di-follow)
  const suggestions = session
    ? await prisma.user.findMany({
        where: {
          id: { not: session.user.id },
          followers: { none: { followerId: session.user.id } },
          role: "USER",
        },
        include: { profile: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="px-2 space-y-4 pt-4">
      {/* Saran Akun */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-brand" />
          <h3 className="font-bold text-sm">Saran Akun</h3>
        </div>
        <div className="space-y-3">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link href={`/profile/${user.username}`}>
                <Avatar src={user.profile?.avatar} name={user.name} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.username}`}>
                  <p className="text-sm font-semibold truncate hover:text-brand transition-colors">
                    {user.name}
                  </p>
                </Link>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
              <Link
                href={`/profile/${user.username}`}
                className="text-xs text-brand font-semibold hover:text-brand-400 shrink-0"
              >
                Follow
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-600 px-2">
        © 2025 JOTENG · Dibuat dengan ❤️
      </p>
    </div>
  );
}