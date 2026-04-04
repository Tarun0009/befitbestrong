import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Cancel any active subscriptions
  await prisma.subscription.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "CANCELLED" },
  });

  // Anonymize user data (soft delete)
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: "Deleted User",
      email: `deleted_${userId}@deleted.com`,
      phone: null,
      passwordHash: null,
      avatarUrl: null,
      fitnessGoals: null,
      weightKg: null,
      heightCm: null,
    },
  });

  return NextResponse.json({ ok: true });
}
