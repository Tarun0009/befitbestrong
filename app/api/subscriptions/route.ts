import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const PLAN_PRICES: Record<string, { price: number; cycle: "MONTHLY" | "QUARTERLY" | "ANNUAL" }> = {
  MONTHLY:   { price: 499,  cycle: "MONTHLY" },
  QUARTERLY: { price: 1197, cycle: "QUARTERLY" },
  ANNUAL:    { price: 3588, cycle: "ANNUAL" },
};

function getNextBillingDate(plan: string): Date {
  const now = new Date();
  if (plan === "MONTHLY") {
    now.setMonth(now.getMonth() + 1);
  } else if (plan === "QUARTERLY") {
    now.setMonth(now.getMonth() + 3);
  } else if (plan === "ANNUAL") {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now;
}

const createSubSchema = z.object({
  plan: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please log in to subscribe" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSubSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { plan } = parsed.data;
    const { price, cycle } = PLAN_PRICES[plan];
    const nextBillingDate = getNextBillingDate(plan);

    // Cancel any existing active subscriptions first
    await prisma.subscription.updateMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      data: { status: "CANCELLED" },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planName: "Iron Club",
        status: "ACTIVE",
        billingCycle: cycle,
        price,
        nextBillingDate,
      },
    });

    return NextResponse.json({
      subscription,
      message: "Iron Club activated!",
    });
  } catch {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscription: subscription ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}
