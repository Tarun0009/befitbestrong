import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  variantId: z.string(),
  quantityChange: z.number().int(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { variantId, quantityChange, reason } = parsed.data;

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const newStock = Math.max(0, variant.stockQuantity + quantityChange);

  await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: newStock },
    }),
    prisma.inventoryLog.create({
      data: {
        variantId,
        type: "ADJUSTMENT",
        quantityChange,
        quantityAfter: newStock,
        reason,
        performedById: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, newStock });
}
