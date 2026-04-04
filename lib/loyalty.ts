import { prisma } from "@/lib/db";
import { LoyaltyTier } from "@prisma/client";

const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  IRON: 0,
  STEEL: 5000,
  TITANIUM: 15000,
};

function tierForPoints(points: number): LoyaltyTier {
  if (points >= TIER_THRESHOLDS.TITANIUM) return "TITANIUM";
  if (points >= TIER_THRESHOLDS.STEEL) return "STEEL";
  return "IRON";
}

export async function earnPoints(
  userId: string,
  points: number,
  description: string,
  type: "EARN" | "BONUS" | "REFERRAL" = "EARN",
  orderId?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true, loyaltyTier: true },
  });
  if (!user) return;

  const newBalance = user.loyaltyPoints + points;
  const newTier = tierForPoints(newBalance);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: newBalance, loyaltyTier: newTier },
    }),
    prisma.loyaltyTransaction.create({
      data: { userId, orderId, type, points, balanceAfter: newBalance, description },
    }),
  ]);

  return { newBalance, newTier };
}

export async function redeemPoints(userId: string, points: number, description: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true, loyaltyTier: true },
  });
  if (!user || user.loyaltyPoints < points) throw new Error("Insufficient points");

  const newBalance = user.loyaltyPoints - points;
  const newTier = tierForPoints(newBalance);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: newBalance, loyaltyTier: newTier },
    }),
    prisma.loyaltyTransaction.create({
      data: { userId, type: "REDEEM", points, balanceAfter: newBalance, description },
    }),
  ]);

  return newBalance;
}

// 1 point = ₹1 discount
export const POINTS_TO_RUPEES = 1;
// 1 ₹ spent = 1 point earned
export const RUPEES_TO_POINTS = 1;

export { tierForPoints, TIER_THRESHOLDS };
