import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, orders, addresses, reviews, loyaltyTx, wishlist] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          loyaltyTier: true,
          loyaltyPoints: true,
          fitnessGoals: true,
          weightKg: true,
          heightCm: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          shippingAddress: true,
        },
      }),
      prisma.shippingAddress.findMany({ where: { userId } }),
      prisma.review.findMany({
        where: { userId },
        select: {
          id: true,
          productId: true,
          rating: true,
          title: true,
          body: true,
          verifiedPurchase: true,
          isApproved: true,
          createdAt: true,
        },
      }),
      prisma.loyaltyTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.wishlistItem.findMany({
        where: { userId },
        include: { product: { select: { name: true, slug: true } } },
      }),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: user,
    orders,
    addresses,
    reviews,
    loyaltyTransactions: loyaltyTx,
    wishlist,
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="my-data.json"`,
    },
  });
}
