import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

async function verifyOwnership(itemId: string, userId?: string, sessionId?: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item) return null;
  if (userId && item.cart.userId !== userId) return null;
  if (!userId && sessionId && item.cart.sessionId !== sessionId) return null;
  return item;
}

// PATCH — update quantity
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;

    const { quantity } = z.object({ quantity: z.number().int().min(1).max(99) }).parse(await req.json());

    const item = await verifyOwnership(id, session?.user?.id, sessionId);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Check stock
    const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
    if (variant && variant.stockQuantity < quantity) {
      return NextResponse.json({ error: `Only ${variant.stockQuantity} in stock` }, { status: 400 });
    }

    await prisma.cartItem.update({ where: { id }, data: { quantity } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE — remove item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;

    const item = await verifyOwnership(id, session?.user?.id, sessionId);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
