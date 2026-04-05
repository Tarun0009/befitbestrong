import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  const role = (session?.user as { role?: string })?.role;
  return session?.user?.id && (role === "ADMIN" || role === "STAFF");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const allowed = ["isFeatured", "isActive", "isNew"] as const;
  const update: Partial<Record<typeof allowed[number], boolean>> = {};

  for (const key of allowed) {
    if (key in body) update[key] = Boolean(body[key]);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const product = await prisma.product.update({ where: { id }, data: update });
  return NextResponse.json({ product });
}
