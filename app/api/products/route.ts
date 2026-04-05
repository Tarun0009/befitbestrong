import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // meta=1 → return categories + brands for admin forms
    if (searchParams.get("meta") === "1") {
      const [categories, brands] = await Promise.all([
        prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      ]);
      return NextResponse.json({ categories, brands });
    }

    const category = searchParams.get("category") ?? undefined;
    const brand = searchParams.get("brand") ?? undefined;
    const sort = searchParams.get("sort") ?? "bestselling";
    const q = searchParams.get("q") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "24");

    const where = {
      isActive: true,
      ...(category && {
        category: { slug: category },
      }),
      ...(brand && {
        brand: { slug: brand },
      }),
      ...(q && {
        name: { contains: q, mode: "insensitive" as const },
      }),
    };

    const orderBy =
      sort === "price-asc"
        ? { basePrice: "asc" as const }
        : sort === "price-desc"
        ? { basePrice: "desc" as const }
        : sort === "newest"
        ? { createdAt: "desc" as const }
        : { createdAt: "desc" as const }; // default: newest first

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          brand: { select: { name: true } },
          category: { select: { name: true, slug: true } },
          variants: {
            where: { isActive: true },
            orderBy: { price: "asc" },
            take: 1,
            select: { price: true, compareAtPrice: true, stockQuantity: true, id: true },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => {
      const variant = p.variants[0];
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand?.name,
        image: p.images[0]?.url ?? "/placeholder-product.jpg",
        price: Number(variant?.compareAtPrice ?? p.basePrice),
        salePrice: variant?.compareAtPrice ? Number(variant.price) : undefined,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
        stockQuantity: variant?.stockQuantity ?? 0,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
      };
    });

    return NextResponse.json({
      products: formatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
