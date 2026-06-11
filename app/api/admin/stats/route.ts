import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, posts, comments, likes, reports, messages] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.message.count(),
  ]);

  // User baru 7 hari terakhir
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });
  const newPostsThisWeek = await prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } });

  // Grafik harian 7 hari
  const dailyStats = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const start = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return Promise.all([
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.post.count({ where: { createdAt: { gte: start, lte: end } } }),
      ]).then(([u, p]) => ({
        date: start.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
        users: u,
        posts: p,
      }));
    })
  );

  return NextResponse.json({
    totals: { users, posts, comments, likes, reports, messages },
    newUsersThisWeek,
    newPostsThisWeek,
    dailyStats,
  });
}
