import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const addItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

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
    const sessionId = cookieStore.get("cart_session")?.value;

    // Check stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }
    if (variant.stockQuantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // Get or create cart
    const cart = await prisma.cart.upsert({
      where: session?.user?.id
        ? { userId: session.user.id }
        : { id: "placeholder" }, // triggers create
      create: {
        ...(session?.user?.id ? { userId: session.user.id } : { sessionId }),
      },
      update: {},
    });

    // Upsert cart item
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
