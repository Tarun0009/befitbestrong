import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import FlashSaleCountdown from "./FlashSaleCountdown";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Zap } from "lucide-react";

export default async function FlashSaleBanner() {
  const now = new Date();
  const sales = await prisma.product.findMany({
    where: {
      saleEndsAt: { gt: now },
      salePrice: { not: null },
      isActive: true,
    },
    take: 3,
    orderBy: { saleEndsAt: "asc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  if (sales.length === 0) return null;

  const earliest = sales[0];

  return (
    <section className="bg-[#C0392B]/10 border-y border-[#C0392B]/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C0392B] rounded-full flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
                Flash Sale
              </h2>
              <p className="text-[#8E8E93] text-xs">Limited time — don&apos;t miss out</p>
            </div>
          </div>
          {earliest.saleEndsAt && (
            <FlashSaleCountdown endsAt={earliest.saleEndsAt.toISOString()} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.map((product) => {
            const discount = product.salePrice
              ? getDiscountPercentage(Number(product.basePrice), Number(product.salePrice))
              : 0;
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-[#1C1C1E] border border-[#C0392B]/20 hover:border-[#C0392B]/50 rounded-xl overflow-hidden flex gap-4 p-4 transition-all group"
              >
                <div className="w-20 h-20 shrink-0 bg-[#2C2C2E] rounded-lg overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F2F2F7] text-sm font-medium line-clamp-2 group-hover:text-[#FF5500] transition-colors">
                    {product.name}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="price-tag text-base">
                      {formatPrice(Number(product.salePrice), { compact: true })}
                    </span>
                    <span className="price-original text-xs">
                      {formatPrice(Number(product.basePrice), { compact: true })}
                    </span>
                  </div>
                  {discount > 0 && (
                    <span className="inline-block mt-1 text-xs bg-[#C0392B] text-white font-bold px-2 py-0.5 rounded">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
