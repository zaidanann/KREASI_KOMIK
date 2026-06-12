import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json();
  const statusMap: Record<string, string> = {
    review:  "REVIEWED",
    resolve: "RESOLVED",
    dismiss: "DISMISSED",
  };

  if (!statusMap[action]) {
    return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
  }

  const updated = await prisma.report.update({
    where: { id },
    data: { status: statusMap[action] as any },
  });

  return NextResponse.json(updated);
}