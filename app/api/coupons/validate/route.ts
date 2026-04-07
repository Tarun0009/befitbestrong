import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const schema = z.object({
  code: z.string(),
  subtotal: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  if (!checkRateLimit(`coupon:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { code, subtotal } = parsed.data;

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
  }

  if (coupon.validFrom && new Date() < coupon.validFrom) {
    return NextResponse.json({ error: "Coupon not yet active" }, { status: 400 });
  }

  if (coupon.validTo && new Date() > coupon.validTo) {
    return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
  }

  if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
  }

  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return NextResponse.json({
      error: `Minimum order value ₹${Number(coupon.minOrderValue).toLocaleString("en-IN")} required`,
    }, { status: 400 });
  }

  let discount = 0;
  let description = "";

  if (coupon.type === "PERCENTAGE") {
    discount = Math.round(subtotal * (Number(coupon.value) / 100));
    description = `${coupon.value}% off`;
  } else if (coupon.type === "FIXED") {
    discount = Math.min(Number(coupon.value), subtotal);
    description = `₹${Number(coupon.value)} off`;
  } else if (coupon.type === "FREE_SHIPPING") {
    discount = 0;
    description = "Free shipping";
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discount,
    description,
  });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
