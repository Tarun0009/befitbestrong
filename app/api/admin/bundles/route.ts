import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as { role?: string })?.role === "ADMIN";
}

const createBundleSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1),
});

export async function GET() {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bundles = await prisma.bundle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, basePrice: true, salePrice: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ bundles });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createBundleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { items, ...rest } = parsed.data;

    const bundle = await prisma.bundle.create({
      data: {
        ...rest,
        price: rest.price,
        comparePrice: rest.comparePrice,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ bundle }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create bundle" }, { status: 500 });
  }
}
