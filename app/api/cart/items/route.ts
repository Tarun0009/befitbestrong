import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { z } from "zod";

const addItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

async function getOrCreateGuestCart(sessionId: string) {
  const existing = await prisma.cart.findFirst({ where: { sessionId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { sessionId } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { variantId, quantity } = parsed.data;
    const session = await auth();
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session")?.value;

    // Validate stock
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (variant.stockQuantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // Get or create cart
    let cart;
    if (session?.user?.id) {
      cart = await prisma.cart.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id },
        update: {},
      });
    } else {
      if (!sessionId) sessionId = randomUUID();
      cart = await getOrCreateGuestCart(sessionId);
    }

    // Upsert item
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, variantId, quantity } });
    }

    const response = NextResponse.json({ success: true });
    if (!session?.user?.id && sessionId) {
      response.cookies.set("cart_session", sessionId, {
        httpOnly: true, maxAge: 60 * 60 * 24 * 30, sameSite: "lax",
      });
    }
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
