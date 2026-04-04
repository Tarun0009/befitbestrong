import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Session } from "next-auth";

async function requireAdmin(session: Session | null) {
  if (!session?.user?.id) return false;
  const role = (session.user as { role?: string }).role;
  return role === "ADMIN" || role === "STAFF";
}

export async function GET() {
  const session = await auth();
  if (!(await requireAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: "desc" },
  });

  // For each affiliate, count orders using their promo code
  const affiliatesWithStats = await Promise.all(
    affiliates.map(async (affiliate) => {
      const [orderCount, revenueResult] = await Promise.all([
        prisma.order.count({
          where: { affiliateCode: affiliate.promoCode },
        }),
        prisma.order.aggregate({
          where: {
            affiliateCode: affiliate.promoCode,
            paymentStatus: "PAID",
          },
          _sum: { total: true },
        }),
      ]);

      return {
        ...affiliate,
        orderCount,
        totalRevenue: Number(revenueResult._sum.total ?? 0),
      };
    })
  );

  return NextResponse.json({ affiliates: affiliatesWithStats });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!(await requireAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, promoCode, commissionPct } = body;

  if (!name || !email || !promoCode) {
    return NextResponse.json({ error: "name, email, and promoCode are required" }, { status: 400 });
  }

  // Check uniqueness
  const existing = await prisma.affiliate.findFirst({
    where: { OR: [{ email }, { promoCode }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An affiliate with this email or promo code already exists" },
      { status: 409 }
    );
  }

  const affiliate = await prisma.affiliate.create({
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      promoCode: String(promoCode).trim().toUpperCase(),
      commissionPct: commissionPct !== undefined ? Number(commissionPct) : 10,
    },
  });

  return NextResponse.json({ affiliate }, { status: 201 });
}
