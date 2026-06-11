import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/constants";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = PAGINATION.ADMIN_TABLE_LIMIT;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { status: status as any },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, username: true } },
        post: {
          select: {
            id: true,
            caption: true,
            user: { select: { id: true, username: true } },
          },
        },
      },
    }),
    prisma.report.count({ where: { status: status as any } }),
  ]);

  return NextResponse.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
}
