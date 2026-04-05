import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Session } from "next-auth";

async function requireAdmin(session: Session | null) {
  if (!session?.user?.id) return false;
  const role = (session.user as { role?: string }).role;
  return role === "ADMIN" || role === "STAFF";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!(await requireAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const affiliate = await prisma.affiliate.findFirst({ where: { id } });
  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  }

  const updated = await prisma.affiliate.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.commissionPct !== undefined && {
        commissionPct: Number(body.commissionPct),
      }),
    },
  });

  return NextResponse.json({ affiliate: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!(await requireAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const affiliate = await prisma.affiliate.findFirst({ where: { id } });
  if (!affiliate) {
    return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
  }

  await prisma.affiliate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
