import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
    take: 20,
  });

  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });

  return NextResponse.json({
    reviews,
    avgRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : 0,
    count: agg._count,
  });
}

const createSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Check if user has purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { userId: session.user.id, paymentStatus: "PAID" },
    },
  });

  const review = await prisma.review.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      verifiedPurchase: !!hasPurchased,
      isApproved: false, // requires admin approval
    },
  });

  return NextResponse.json({ review, message: "Review submitted — pending approval" }, { status: 201 });
}
