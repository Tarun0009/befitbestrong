import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                salePrice: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: "asc" },
                  select: { url: true, altText: true },
                },
              },
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
