import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/validators/post";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await prisma.report.findFirst({ where: { postId: id, reporterId: session.user.id } });
  if (existing) return NextResponse.json({ error: "Kamu sudah melaporkan postingan ini." }, { status: 400 });

  const report = await prisma.report.create({
    data: { postId: id, reporterId: session.user.id, reason: parsed.data.reason, description: parsed.data.description },
  });

  return NextResponse.json(report, { status: 201 });
}