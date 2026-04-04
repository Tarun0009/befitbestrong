import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  const role = (session?.user as { role?: string })?.role;
  return session?.user?.id && (role === "ADMIN" || role === "STAFF");
}

const schema = z.object({
  productId: z.string(),
  salePrice: z.number().positive(),
  saleEndsAt: z.string().datetime(),
});

// GET — list all active flash sales
export async function GET() {
  const sales = await prisma.product.findMany({
    where: { saleEndsAt: { not: null }, isActive: true },
    select: {
      id: true, name: true, slug: true, basePrice: true, salePrice: true, saleEndsAt: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { saleEndsAt: "asc" },
  });
  return NextResponse.json({ sales });
}

// POST — set a flash sale on a product
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const product = await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      salePrice: parsed.data.salePrice,
      saleEndsAt: new Date(parsed.data.saleEndsAt),
    },
  });

  return NextResponse.json({ product });
}

// DELETE — remove flash sale from a product
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  await prisma.product.update({
    where: { id: productId },
    data: { saleEndsAt: null },
  });

  return NextResponse.json({ ok: true });
}
