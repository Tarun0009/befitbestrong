import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateOrderNumber, calculateGST } from "@/lib/utils";
import { z } from "zod";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const createOrderSchema = z.object({
  cartId: z.string(),
  shippingAddressId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  shippingAddress: z
    .object({
      fullName: z.string(),
      phone: z.string(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      pincode: z.string(),
    })
    .optional(),
  paymentMethod: z.enum(["UPI", "CARD", "NETBANKING", "WALLET", "EMI", "BNPL", "COD"]),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const session = await auth();
    const data = parsed.data;

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { id: data.cartId },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0
    );
    const shippingCost = subtotal >= 2999 ? 0 : 99;
    const gst = calculateGST(subtotal);
    const discount = 0; // Apply coupon logic here
    const total = subtotal + shippingCost + gst - discount;

    // Handle shipping address
    let shippingAddressId = data.shippingAddressId;
    if (!shippingAddressId && data.shippingAddress && session?.user?.id) {
      const addr = await prisma.shippingAddress.create({
        data: { ...data.shippingAddress, userId: session.user.id },
      });
      shippingAddressId = addr.id;
    }

    // Create Razorpay order (for online payments)
    let razorpayOrderId: string | undefined;
    if (data.paymentMethod !== "COD") {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // paise
        currency: "INR",
        receipt: generateOrderNumber(),
      });
      razorpayOrderId = rzpOrder.id;
    }

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id,
        guestEmail: data.guestEmail,
        status: data.paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
        subtotal,
        discount,
        shippingCost,
        gst,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
        razorpayOrderId,
        couponCode: data.couponCode,
        shippingAddressId,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            productId: item.variant.productId,
            productName: item.variant.product.name,
            variantTitle: [item.variant.option1Value, item.variant.option2Value]
              .filter(Boolean)
              .join(" / "),
            quantity: item.quantity,
            unitPrice: Number(item.variant.price),
            totalPrice: Number(item.variant.price) * item.quantity,
          })),
        },
      },
    });

    // Decrement stock
    await Promise.all(
      cart.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      )
    );

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json({
      order: { id: order.id, orderNumber: order.orderNumber, total: order.total },
      razorpayOrderId,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { take: 3 },
        shippingAddress: true,
      },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
