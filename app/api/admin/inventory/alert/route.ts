import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user?.id || (role !== "ADMIN" && role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use raw query to compare stockQuantity against lowStockAlert column
    const alerts = await prisma.$queryRaw<
      {
        id: string;
        sku: string;
        stock_quantity: number;
        low_stock_alert: number;
        option1_value: string | null;
        option2_value: string | null;
        product_name: string;
        product_id: string;
      }[]
    >`
      SELECT
        pv.id,
        pv.sku,
        pv.stock_quantity,
        pv.low_stock_alert,
        pv.option1_value,
        pv.option2_value,
        p.name AS product_name,
        p.id   AS product_id
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.is_active = true
        AND pv.stock_quantity <= pv.low_stock_alert
      ORDER BY pv.stock_quantity ASC
    `;

    const formatted = alerts.map((row) => ({
      id: row.id,
      sku: row.sku,
      stockQuantity: row.stock_quantity,
      lowStockAlert: row.low_stock_alert,
      variantLabel:
        [row.option1_value, row.option2_value].filter(Boolean).join(" / ") || "Default",
      productName: row.product_name,
      productId: row.product_id,
    }));

    return NextResponse.json({ alerts: formatted, count: formatted.length });
  } catch (err) {
    console.error("Inventory alert fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
