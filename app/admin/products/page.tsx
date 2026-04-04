import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/");

  const { page: pageParam, q: qParam } = await searchParams;
  const page = parseInt(pageParam ?? "1");
  const q = qParam ?? "";
  const take = 20;
  const skip = (page - 1) * take;

  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }] }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true }, select: { price: true, stockQuantity: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <AdminLayout activeHref="/admin/products">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">Products</h1>
          <p className="text-[#8E8E93] text-xs">{total} products</p>
        </div>
        <Link href="/admin/products/new"
          className="flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#CC4400] text-white text-sm font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </header>

      <div className="p-4 sm:p-8">
        {/* Search */}
        <form className="mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search products..."
            className="w-full max-w-sm bg-[#1C1C1E] border border-[#2C2C2E] focus:border-[#FF5500] text-[#F2F2F7] rounded-lg px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-[#8E8E93]/50"
          />
        </form>

        <div className="overflow-x-auto">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden min-w-150">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2C2C2E]">
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#8E8E93] text-xs uppercase tracking-widest font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[#8E8E93]">No products found</td></tr>
                ) : products.map((p, i) => {
                  const minPrice = p.variants.length ? Math.min(...p.variants.map((v) => Number(v.price))) : Number(p.basePrice);
                  const totalStock = p.variants.reduce((s, v) => s + v.stockQuantity, 0);
                  return (
                    <tr key={p.id} className={`border-b border-[#2C2C2E] hover:bg-[#2C2C2E]/30 transition-colors ${i === products.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3">
                        <p className="text-[#F2F2F7] text-xs font-medium max-w-50 truncate">{p.name}</p>
                        <p className="text-[#8E8E93] text-xs font-mono">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-[#8E8E93] text-xs">{p.category.name}</td>
                      <td className="px-4 py-3 price-tag text-xs">{formatPrice(minPrice, { compact: true })}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-xs ${totalStock === 0 ? "text-[#C0392B]" : totalStock < 10 ? "text-yellow-400" : "text-[#1A7A4A]"}`}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {p.isActive && <span className="text-xs bg-[#1A7A4A]/20 text-[#1A7A4A] px-2 py-0.5 rounded font-bold">Active</span>}
                          {p.isFeatured && <span className="text-xs bg-[#FF5500]/10 text-[#FF5500] px-2 py-0.5 rounded font-bold">Featured</span>}
                          {p.isNew && <span className="text-xs bg-[#0A4FA6]/20 text-[#0A4FA6] px-2 py-0.5 rounded font-bold">New</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-[#FF5500] hover:text-[#CC4400] transition-colors">Edit</Link>
                          <Link href={`/products/${p.slug}`} target="_blank" className="text-xs text-[#8E8E93] hover:text-[#F2F2F7] transition-colors">View</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {total > take && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-[#8E8E93] text-sm">Showing {skip + 1}–{Math.min(skip + take, total)} of {total}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/products?${q ? `q=${q}&` : ""}page=${page - 1}`}
                  className="px-3 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] rounded text-sm text-[#8E8E93] hover:text-[#F2F2F7]">
                  Previous
                </Link>
              )}
              {page < Math.ceil(total / take) && (
                <Link href={`/admin/products?${q ? `q=${q}&` : ""}page=${page + 1}`}
                  className="px-3 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] rounded text-sm text-[#8E8E93] hover:text-[#F2F2F7]">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
