import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redeemPoints, POINTS_TO_RUPEES } from "@/lib/loyalty";
import { z } from "zod";

const schema = z.object({ points: z.number().int().positive() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  try {
    const newBalance = await redeemPoints(
      session.user.id,
      parsed.data.points,
      "Redeemed at checkout"
    );
    return NextResponse.json({
      ok: true,
      pointsUsed: parsed.data.points,
      discount: parsed.data.points * POINTS_TO_RUPEES,
      newBalance,
    });
  } catch {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
  }
}
