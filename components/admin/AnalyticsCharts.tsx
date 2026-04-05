"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface DayRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface TopProduct {
  name: string;
  orders: number;
}

interface DayUsers {
  date: string;
  users: number;
}

interface AnalyticsChartsProps {
  revenueData: DayRevenue[];
  statusData: StatusCount[];
  topProducts: TopProduct[];
  newUsersData: DayUsers[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#EAB308",
  CONFIRMED: "#3B82F6",
  PACKED: "#A855F7",
  SHIPPED: "#0EA5E9",
  DELIVERED: "#22C55E",
  RETURNED: "#8E8E93",
  CANCELLED: "#EF4444",
};

const PIE_FALLBACK_COLORS = [
  "#FF5500",
  "#3B82F6",
  "#22C55E",
  "#A855F7",
  "#EAB308",
  "#EF4444",
  "#8E8E93",
];

function TooltipContent({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-[#8E8E93] mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
          {suffix}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsCharts({
  revenueData,
  statusData,
  topProducts,
  newUsersData,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* Revenue Chart */}
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
        <h3 className="text-[#F2F2F7] font-semibold mb-1">Revenue (Last 30 Days)</h3>
        <p className="text-[#8E8E93] text-xs mb-4">Daily paid order revenue in ₹</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenueData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8E8E93", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#2C2C2E" }}
            />
            <YAxis
              tick={{ fill: "#8E8E93", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
              }
              width={52}
            />
            <Tooltip content={<TooltipContent prefix="₹" />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#FF5500"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#FF5500" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Pie + Top Products Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
          <h3 className="text-[#F2F2F7] font-semibold mb-1">Order Status Breakdown</h3>
          <p className="text-[#8E8E93] text-xs mb-4">Distribution of all orders by status</p>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {statusData.map((entry, i) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0];
                    return (
                      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg px-3 py-2 text-xs shadow-lg">
                        <p className="text-[#8E8E93]">{d.name}</p>
                        <p className="text-[#F2F2F7] font-semibold">{String(d.value)} orders</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-[#8E8E93] text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-[#8E8E93] text-sm">
              No order data
            </div>
          )}
        </div>

        {/* Top Products Bar */}
        <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
          <h3 className="text-[#F2F2F7] font-semibold mb-1">Top 5 Products</h3>
          <p className="text-[#8E8E93] text-xs mb-4">By number of orders</p>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 4, right: 12, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#8E8E93", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#2C2C2E" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#8E8E93", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip content={<TooltipContent suffix=" orders" />} />
                <Bar dataKey="orders" fill="#FF5500" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-[#8E8E93] text-sm">
              No product data
            </div>
          )}
        </div>
      </div>

      {/* New Users Chart */}
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5">
        <h3 className="text-[#F2F2F7] font-semibold mb-1">New Customers (Last 30 Days)</h3>
        <p className="text-[#8E8E93] text-xs mb-4">Daily new user registrations</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={newUsersData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8E8E93", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#2C2C2E" }}
            />
            <YAxis
              tick={{ fill: "#8E8E93", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip content={<TooltipContent suffix=" users" />} />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
