import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env") });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/befitbestrong",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin User ──────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@befitbestrong.in" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@befitbestrong.in",
      passwordHash: adminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log("✅ Admin user created: admin@befitbestrong.in / admin123");

  // ── Categories ──────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "equipment" }, update: {}, create: { name: "Equipment", slug: "equipment", sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "supplements" }, update: {}, create: { name: "Supplements", slug: "supplements", sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "apparel" }, update: {}, create: { name: "Apparel", slug: "apparel", sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "recovery" }, update: {}, create: { name: "Recovery", slug: "recovery", sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "programs" }, update: {}, create: { name: "Programs", slug: "programs", sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: "bundles" }, update: {}, create: { name: "Bundles", slug: "bundles", sortOrder: 6 } }),
  ]);
  const [equipment, supplements] = categories;
  console.log("✅ Categories created");

  // ── Brands ──────────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: "ironforge" }, update: {}, create: { name: "IronForge", slug: "ironforge" } }),
    prisma.brand.upsert({ where: { slug: "muscletech" }, update: {}, create: { name: "MuscleTech", slug: "muscletech" } }),
    prisma.brand.upsert({ where: { slug: "powerfit" }, update: {}, create: { name: "PowerFit", slug: "powerfit" } }),
    prisma.brand.upsert({ where: { slug: "beastgear" }, update: {}, create: { name: "BeastGear", slug: "beastgear" } }),
  ]);
  const [ironforge, muscletech] = brands;
  console.log("✅ Brands created");

  // ── Products ─────────────────────────────────────────
  const productSeed = [
    {
      name: "Olympic Barbell 20kg — Competition Grade",
      slug: "olympic-barbell-20kg",
      description: "Competition-grade Olympic barbell. 220cm shaft, 28mm diameter, 450kg capacity. Hard chrome sleeves.",
      categoryId: equipment.id,
      brandId: ironforge.id,
      basePrice: 12999,
      isFeatured: true,
      variants: [
        { sku: "IF-BAR-20KG", price: 9999, compareAtPrice: 12999, stockQuantity: 15, weightGrams: 20000 },
        { sku: "IF-BAR-15KG", option1Name: "Weight", option1Value: "Women's 15kg", price: 8499, compareAtPrice: 10999, stockQuantity: 8, weightGrams: 15000 },
      ],
      images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop"],
    },
    {
      name: "Adjustable Dumbbell Set 5-25kg",
      slug: "adjustable-dumbbell-set",
      description: "Space-saving adjustable dumbbell set. Replace 9 pairs of dumbbells. Quick-change selector.",
      categoryId: equipment.id,
      brandId: ironforge.id,
      basePrice: 8499,
      isNew: true,
      isFeatured: true,
      variants: [
        { sku: "IF-DUMP-5-25", price: 8499, stockQuantity: 3, weightGrams: 50000 },
      ],
      images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop"],
    },
    {
      name: "Whey Protein Isolate",
      slug: "whey-protein-isolate",
      description: "90% protein per serving. Fast-absorbing whey isolate. 27g protein per scoop. NSF certified.",
      categoryId: supplements.id,
      brandId: muscletech.id,
      basePrice: 5999,
      isFeatured: true,
      variants: [
        { sku: "MT-WPI-CHOC-2KG", option1Name: "Flavor", option1Value: "Chocolate Fudge", option2Name: "Size", option2Value: "2kg", price: 3799, compareAtPrice: 4999, stockQuantity: 42, weightGrams: 2200 },
        { sku: "MT-WPI-VAN-2KG", option1Name: "Flavor", option1Value: "Vanilla", option2Name: "Size", option2Value: "2kg", price: 3799, compareAtPrice: 4999, stockQuantity: 28, weightGrams: 2200 },
        { sku: "MT-WPI-CHOC-5KG", option1Name: "Flavor", option1Value: "Chocolate Fudge", option2Name: "Size", option2Value: "5kg", price: 8999, compareAtPrice: 11999, stockQuantity: 15, weightGrams: 5500 },
      ],
      images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=800&fit=crop"],
    },
    {
      name: "Power Cage Squat Rack",
      slug: "power-cage-squat-rack",
      description: "Heavy-duty power cage for home gym. 500kg capacity. Includes J-hooks, safety bars, and pull-up bar.",
      categoryId: equipment.id,
      brandId: ironforge.id,
      basePrice: 34999,
      isFeatured: true,
      variants: [
        { sku: "IF-CAGE-HEAVY", price: 28999, compareAtPrice: 34999, stockQuantity: 8, weightGrams: 120000 },
      ],
      images: ["https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=800&fit=crop"],
    },
    {
      name: "Creatine Monohydrate",
      slug: "creatine-monohydrate",
      description: "Micronized creatine monohydrate. Pharmaceutical grade. Mixes instantly. 5g per serving.",
      categoryId: supplements.id,
      brandId: muscletech.id,
      basePrice: 1999,
      variants: [
        { sku: "MT-CREAT-UNF-500G", option1Name: "Size", option1Value: "500g", price: 1299, compareAtPrice: 1999, stockQuantity: 60, weightGrams: 560 },
        { sku: "MT-CREAT-UNF-1KG", option1Name: "Size", option1Value: "1kg", price: 2299, compareAtPrice: 3499, stockQuantity: 35, weightGrams: 1100 },
      ],
      images: ["https://images.unsplash.com/photo-1559181567-c3190bfa4cfe?w=800&h=800&fit=crop"],
    },
  ];

  for (const p of productSeed) {
    const { variants, images, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        isActive: true,
        images: { create: images.map((url, i) => ({ url, sortOrder: i })) },
        variants: { create: variants },
      },
    });
    console.log(`  ✅ Product: ${product.name}`);
  }

  // ── Coupons ──────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: 999,
      maxUses: 1000,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      type: "FREE_SHIPPING",
      value: 0,
      minOrderValue: 499,
      isActive: true,
    },
  });
  console.log("✅ Coupons created: WELCOME10, FREESHIP");

  console.log("\n🎉 Seed complete!");
  console.log("   Admin: admin@befitbestrong.in / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
