export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import ReviewActions from "./ReviewActions";
import { Star, ShieldCheck } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-[#FF5500] text-[#FF5500]" : "text-[#2C2C2E]"}`}
        />
      ))}
    </div>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/");

  const { tab } = await searchParams;
  const activeTab = tab === "approved" ? "approved" : "pending";

  const [pending, approved] = await Promise.all([
    prisma.review.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const reviews = activeTab === "pending" ? pending : approved;

  return (
    <AdminLayout activeHref="/admin/reviews">
      <header className="bg-[#1C1C1E] border-b border-[#2C2C2E] px-4 sm:px-8 py-4">
        <h1 className="font-(family-name:--font-bebas-neue) text-2xl text-[#F2F2F7] tracking-wide">
          Review Moderation
        </h1>
        <p className="text-[#8E8E93] text-xs">
          {pending.length} pending · {approved.length} approved
        </p>
      </header>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <Link
            href="/admin/reviews?tab=pending"
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "pending"
                ? "bg-[#FF5500] text-white"
                : "bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F2F2F7] border border-[#2C2C2E]"
            }`}
          >
            Pending ({pending.length})
          </Link>
          <Link
            href="/admin/reviews?tab=approved"
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "approved"
                ? "bg-[#FF5500] text-white"
                : "bg-[#1C1C1E] text-[#8E8E93] hover:text-[#F2F2F7] border border-[#2C2C2E]"
            }`}
          >
            Approved ({approved.length})
          </Link>
        </div>

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-12 text-center">
            <p className="text-[#8E8E93] text-sm">
              {activeTab === "pending" ? "No reviews pending approval" : "No approved reviews yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 hover:border-[#FF5500]/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: review content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Product + meta row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="text-[#FF5500] hover:text-[#CC4400] text-xs font-semibold transition-colors truncate"
                      >
                        {review.product.name}
                      </Link>
                      <span className="text-[#2C2C2E]">·</span>
                      <StarRating rating={review.rating} />
                      {review.verifiedPurchase && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#1A7A4A] bg-[#1A7A4A]/10 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      <span className="text-[#8E8E93] text-xs ml-auto shrink-0">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* User */}
                    <p className="text-[#8E8E93] text-xs">
                      {review.user.name ?? "Anonymous"}
                      {review.user.email && (
                        <span className="text-[#2C2C2E] mx-1">·</span>
                      )}
                      <span className="text-[#8E8E93]">{review.user.email}</span>
                    </p>

                    {/* Review text */}
                    {review.title && (
                      <p className="text-[#F2F2F7] text-sm font-semibold">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-[#8E8E93] text-sm leading-relaxed line-clamp-3">{review.body}</p>
                    )}

                    {/* Admin reply */}
                    {review.adminReply && (
                      <div className="bg-[#FF5500]/5 border-l-2 border-[#FF5500] pl-3 py-1 mt-2">
                        <p className="text-[#8E8E93] text-xs font-semibold uppercase tracking-wide mb-1">Admin Reply</p>
                        <p className="text-[#F2F2F7] text-xs leading-relaxed">{review.adminReply}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="shrink-0">
                    <ReviewActions id={review.id} isApproved={review.isApproved} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
