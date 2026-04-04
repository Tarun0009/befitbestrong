import { prisma } from "@/lib/db";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowRight } from "lucide-react";

export const metadata = { title: "Bundles — BeFitBeStrong" };

export default async function BundlesPage() {
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
              images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wide">
            Bundle Deals
          </h1>
          <p className="text-[#8E8E93] mt-2">
            Save more by buying curated product bundles — everything you need, priced together.
          </p>
        </div>

        {bundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-12 h-12 text-[#2C2C2E] mb-4" />
            <h2 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide mb-2">
              No Bundles Available
            </h2>
            <p className="text-[#8E8E93] mb-6">Check back soon — we&apos;re building great deals for you.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => {
              const retailTotal = bundle.items.reduce((sum, item) => {
                const price = item.product.salePrice
                  ? Number(item.product.salePrice)
                  : Number(item.product.basePrice);
                return sum + price * item.quantity;
              }, 0);
              const savings = retailTotal - Number(bundle.price);

              return (
                <div
                  key={bundle.id}
                  className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl overflow-hidden flex flex-col hover:border-[#FF5500]/40 transition-all"
                >
                  {/* Bundle image or gradient */}
                  {bundle.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bundle.imageUrl}
                      alt={bundle.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,0.15),transparent_60%)] bg-[#0A0A0A] flex items-center justify-center">
                      <Package className="w-12 h-12 text-[#FF5500]/40" />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide mb-1">
                      {bundle.name}
                    </h2>
                    {bundle.description && (
                      <p className="text-[#8E8E93] text-sm line-clamp-2 mb-3">
                        {bundle.description}
                      </p>
                    )}

                    {/* Products list (up to 3 names) */}
                    <div className="mb-4 space-y-1">
                      {bundle.items.slice(0, 3).map((item) => (
                        <p key={item.id} className="text-[#8E8E93] text-xs flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-[#FF5500] rounded-full inline-block shrink-0" />
                          {item.quantity > 1 && (
                            <span className="text-[#FF5500] font-semibold">{item.quantity}×</span>
                          )}
                          {item.product.name}
                        </p>
                      ))}
                      {bundle.items.length > 3 && (
                        <p className="text-[#8E8E93] text-xs">
                          +{bundle.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-(family-name:--font-bebas-neue) text-3xl text-[#FF5500]">
                          {formatPrice(Number(bundle.price), { compact: true })}
                        </span>
                        {bundle.comparePrice && (
                          <span className="text-[#8E8E93] text-sm line-through">
                            {formatPrice(Number(bundle.comparePrice), { compact: true })}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <p className="text-green-400 text-xs font-medium mb-3">
                          Save {formatPrice(savings, { compact: true })} vs buying separately
                        </p>
                      )}

                      <Link
                        href={`/bundles/${bundle.slug}`}
                        className="w-full flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#CC4400] text-white font-bold uppercase tracking-widest py-3 rounded transition-colors text-sm"
                      >
                        View Bundle <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
