import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true, fitnessGoals: true, weightKg: true, heightCm: true, email: true, loyaltyTier: true, loyaltyPoints: true },
  });

  return NextResponse.json({ user });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  fitnessGoals: z.string().optional(),
  weightKg: z.number().positive().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { name: true, phone: true, fitnessGoals: true, weightKg: true, heightCm: true },
  });

  return NextResponse.json({ user });
}
