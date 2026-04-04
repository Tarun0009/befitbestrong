import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowLeft, Tag } from "lucide-react";
import AddBundleToCartButton from "@/components/store/AddBundleToCartButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const bundle = await prisma.bundle.findUnique({ where: { slug }, select: { name: true } });
  return { title: bundle ? `${bundle.name} — BeFitBeStrong` : "Bundle Not Found" };
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params;

  const bundle = await prisma.bundle.findUnique({
    where: { slug },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
              variants: {
                where: { isActive: true },
                take: 1,
                orderBy: { price: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!bundle || !bundle.isActive) notFound();

  // Calculate retail total (sum of individual product prices × quantity)
  const retailTotal = bundle.items.reduce((sum, item) => {
    const price = item.product.salePrice
      ? Number(item.product.salePrice)
      : Number(item.product.basePrice);
    return sum + price * item.quantity;
  }, 0);
  const savings = Math.max(0, retailTotal - Number(bundle.price));

  // Build cart items for AddBundleToCartButton
  const cartItems = bundle.items
    .filter((item) => item.product.variants.length > 0)
    .map((item) => ({
      variantId: item.product.variants[0].id,
      quantity: item.quantity,
    }));

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/bundles"
          className="inline-flex items-center gap-2 text-[#8E8E93] hover:text-[#F2F2F7] text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Bundles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Bundle image */}
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl overflow-hidden">
            {bundle.imageUrl ? (
              <Image
                src={bundle.imageUrl}
                alt={bundle.name}
                width={600}
                height={400}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="w-full h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,0.12),transparent_60%)] flex items-center justify-center">
                <Package className="w-20 h-20 text-[#FF5500]/20" />
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wide mb-3">
              {bundle.name}
            </h1>
            {bundle.description && (
              <p className="text-[#8E8E93] text-base leading-relaxed mb-6">
                {bundle.description}
              </p>
            )}

            {/* Pricing */}
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-(family-name:--font-bebas-neue) text-4xl text-[#FF5500]">
                  {formatPrice(Number(bundle.price), { compact: true })}
                </span>
                {bundle.comparePrice && (
                  <span className="text-[#8E8E93] text-lg line-through">
                    {formatPrice(Number(bundle.comparePrice), { compact: true })}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <Tag className="w-4 h-4" />
                  Save {formatPrice(savings, { compact: true })} vs buying separately
                </div>
              )}
            </div>

            {/* Add to Cart */}
            {cartItems.length > 0 ? (
              <AddBundleToCartButton items={cartItems} />
            ) : (
              <p className="text-[#8E8E93] text-sm">
                Some products in this bundle are currently unavailable.
              </p>
            )}
          </div>
        </div>

        {/* Products in bundle */}
        <section className="mt-14">
          <h2 className="font-(family-name:--font-bebas-neue) text-3xl text-[#F2F2F7] tracking-wide mb-6">
            What&apos;s in this bundle
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bundle.items.map((item) => {
              const product = item.product;
              const image = product.images[0];
              const retailPrice = product.salePrice
                ? Number(product.salePrice)
                : Number(product.basePrice);

              return (
                <div
                  key={item.id}
                  className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden flex gap-4 p-4 hover:border-[#FF5500]/30 transition-all"
                >
                  <div className="w-20 h-20 shrink-0 bg-[#2C2C2E] rounded-lg overflow-hidden">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#8E8E93]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-[#F2F2F7] text-sm font-medium line-clamp-2 hover:text-[#FF5500] transition-colors"
                    >
                      {product.name}
                    </Link>
                    {item.quantity > 1 && (
                      <p className="text-[#FF5500] text-xs font-bold mt-0.5">
                        ×{item.quantity}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-[#F2F2F7] text-sm font-semibold">
                        {formatPrice(retailPrice, { compact: true })}
                      </span>
                      {product.salePrice && (
                        <span className="text-[#8E8E93] text-xs line-through">
                          {formatPrice(Number(product.basePrice), { compact: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
