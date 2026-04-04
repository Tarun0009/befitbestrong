import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { take: 1, orderBy: { sortOrder: "asc" } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Guest cart via sessionId
  const existing = await prisma.cart.findFirst({
    where: { sessionId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { take: 1 } } },
            },
          },
        },
      },
    },
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { sessionId: sessionId ?? randomUUID() },
    include: { items: { include: { variant: { include: { product: { include: { images: { take: 1 } } } } } } } },
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value ?? randomUUID();

    const cart = await getOrCreateCart(session?.user?.id, sessionId);

    const items = cart.items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      product: {
        name: item.variant.product.name,
        slug: item.variant.product.slug,
        image: item.variant.product.images[0]?.url ?? "/placeholder-product.jpg",
      },
      variant: {
        option1: item.variant.option1Value,
        option2: item.variant.option2Value,
        price: Number(item.variant.price),
        stockQuantity: item.variant.stockQuantity,
      },
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    const response = NextResponse.json({
      cart: { id: cart.id, items, subtotal, couponCode: cart.couponCode },
    });

    // Set session cookie for guests
    if (!session?.user?.id) {
      response.cookies.set("cart_session", sessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}
