import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.id || (role !== "ADMIN" && role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { select: { productName: true, quantity: true } },
        user: { select: { email: true, name: true } },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.trackingNumber !== undefined) updateData.trackingNumber = parsed.data.trackingNumber;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    if (parsed.data.status === "SHIPPED") {
      updateData.shippedAt = new Date();
    } else if (parsed.data.status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: { select: { productName: true, variantTitle: true, quantity: true, unitPrice: true } },
        user: { select: { email: true, name: true } },
        shippingAddress: true,
      },
    });

    // Send emails based on status transitions
    const emailTo = order.user?.email ?? order.guestEmail;
    if (emailTo) {
      if (parsed.data.status === "CONFIRMED" && existingOrder.status === "PENDING") {
        // Online payment confirmed — send order confirmation
        sendOrderConfirmationEmail(emailTo, {
          orderNumber: order.orderNumber,
          total: Number(order.total),
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shippingCost),
          gst: Number(order.gst),
          discount: Number(order.discount),
          paymentMethod: order.paymentMethod ?? "ONLINE",
          items: order.items.map((item) => ({
            productName: item.productName,
            variantTitle: item.variantTitle ?? undefined,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          })),
          shippingAddress: order.shippingAddress
            ? {
                fullName: order.shippingAddress.fullName,
                line1: order.shippingAddress.line1,
                line2: order.shippingAddress.line2 ?? undefined,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                pincode: order.shippingAddress.pincode,
              }
            : null,
        }).catch(() => {});
      }

      if (parsed.data.status === "SHIPPED") {
        sendShippingConfirmationEmail(emailTo, {
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber,
          items: order.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
          })),
        }).catch(() => {});
      }
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Order update failed:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.id || (role !== "ADMIN" && role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
