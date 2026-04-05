export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";

export default async function AccountSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, loyaltyPoints: true, loyaltyTier: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            <AccountSidebar
              user={{
                name: user.name,
                email: user.email,
                loyaltyTier: user.loyaltyTier,
                loyaltyPoints: user.loyaltyPoints,
              }}
            />
          </aside>

          {/* Page content */}
          <main className="flex-1 min-w-0">
            {/* Mobile pill nav */}
            <AccountSidebar
              user={{
                name: user.name,
                email: user.email,
                loyaltyTier: user.loyaltyTier,
                loyaltyPoints: user.loyaltyPoints,
              }}
            />
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
