import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import type { Session } from "next-auth";

function isAdmin(s: Session | null) {
  const role = (s?.user as { role?: string })?.role;
  return s?.user?.id && (role === "ADMIN" || role === "STAFF");
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const variantSchema = z.object({
  sku: z.string().min(1),
  option1Name: z.string().optional(),
  option1Value: z.string().optional(),
  option2Name: z.string().optional(),
  option2Value: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(10),
  weightGrams: z.number().int().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDesc: z.string().max(300).optional(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  basePrice: z.number().positive(),
  salePrice: z.number().optional(),
  saleEndsAt: z.string().datetime().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  imageUrls: z.array(z.string().url()).default([]),
  variants: z.array(variantSchema).min(1, "At least one variant required"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(data.name);

  // Ensure slug is unique
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: `Slug "${slug}" already taken` }, { status: 409 });

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      shortDesc: data.shortDesc,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      basePrice: data.basePrice,
      salePrice: data.salePrice ?? null,
      saleEndsAt: data.saleEndsAt ? new Date(data.saleEndsAt) : null,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      isNew: data.isNew,
      tags: data.tags,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      images: {
        create: data.imageUrls.map((url, i) => ({ url, sortOrder: i })),
      },
      variants: {
        create: data.variants.map((v) => ({
          sku: v.sku,
          option1Name: v.option1Name || null,
          option1Value: v.option1Value || null,
          option2Name: v.option2Name || null,
          option2Value: v.option2Value || null,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          stockQuantity: v.stockQuantity,
          lowStockAlert: v.lowStockAlert,
          weightGrams: v.weightGrams ?? null,
          imageUrl: v.imageUrl || null,
        })),
      },
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
