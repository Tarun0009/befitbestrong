import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { earnPoints } from "@/lib/loyalty";

function generateCode(userId: string): string {
  const suffix = userId.slice(-6).toUpperCase();
  return `BFBS${suffix}`;
}

// GET — fetch or auto-create the current user's referral record
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let referral = await prisma.referral.findFirst({
    where: { referrerId: session.user.id },
    include: {
      referred: { select: { name: true, email: true, createdAt: true } },
    },
  });

  if (!referral) {
    referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        referralCode: generateCode(session.user.id),
      },
      include: {
        referred: { select: { name: true, email: true, createdAt: true } },
      },
    });
  }

  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/register?ref=${referral.referralCode}`;

  return NextResponse.json({ referral, referralUrl });
}

// POST — apply a referral code during registration (called from register API)
export async function POST(req: NextRequest) {
  const { referralCode, newUserId } = await req.json();
  if (!referralCode || !newUserId) return NextResponse.json({ ok: false });

  const referral = await prisma.referral.findUnique({
    where: { referralCode: referralCode.toUpperCase() },
  });

  if (!referral || referral.isUsed || referral.referrerId === newUserId) {
    return NextResponse.json({ ok: false });
  }

  await prisma.referral.update({
    where: { id: referral.id },
    data: { referredId: newUserId, isUsed: true },
  });

  // Grant 500 bonus points to referrer
  await earnPoints(referral.referrerId, 500, "Referral bonus — friend joined", "REFERRAL");

  return NextResponse.json({ ok: true });
}
