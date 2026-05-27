"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { formatSom } from "@/lib/utils";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  format,
  subDays,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, ShoppingBag, Coins, Calendar, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "kunlik" | "oylik" | "yillik";

export default function AdminDashboard() {
  const orders = useAppStore((s) => s.orders);
  const products = useAppStore((s) => s.products);
  const [period, setPeriod] = useState<Period>("kunlik");

  const range = useMemo(() => {
    const now = new Date();
    if (period === "kunlik") return { start: startOfDay(now), end: endOfDay(now) };
    if (period === "oylik") return { start: startOfMonth(now), end: endOfMonth(now) };
    return { start: startOfYear(now), end: endOfYear(now) };
  }, [period]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) =>
        isWithinInterval(new Date(o.closedAt || o.createdAt), range)
      ),
    [orders, range]
  );

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce(
      (s, o) => s + o.items.reduce((s2, i) => s2 + (i.weight !== undefined ? 1 : i.quantity), 0),
      0
    );
    const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // mahsulot bo'yicha statistika
    const byProduct: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredOrders.forEach((o) =>
      o.items.forEach((i) => {
        if (!byProduct[i.productId]) {
          byProduct[i.productId] = { name: i.productName, qty: 0, revenue: 0 };
        }
        byProduct[i.productId].qty += i.weight !== undefined ? (i.weight ?? 1) : i.quantity;
        byProduct[i.productId].revenue += i.subtotal;
      })
    );
    const productStats = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue);

    // stol bo'yicha
    const byTable: Record<string, { name: string; orders: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      if (!byTable[o.tableId]) {
        byTable[o.tableId] = { name: o.tableName, orders: 0, revenue: 0 };
      }
      byTable[o.tableId].orders += 1;
      byTable[o.tableId].revenue += o.total;
    });
    const tableStats = Object.values(byTable).sort((a, b) => b.revenue - a.revenue);

    // shashlik bo'yicha alohida
    const shashlikIds = products
      .filter((p) => p.category === "shashlik")
      .map((p) => p.id);

    const shashlikByTable: Record<string, Record<string, number>> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((i) => {
        if (shashlikIds.includes(i.productId)) {
          if (!shashlikByTable[o.tableName]) shashlikByTable[o.tableName] = {};
          shashlikByTable[o.tableName][i.productName] =
            (shashlikByTable[o.tableName][i.productName] || 0) + i.quantity;
        }
      });
    });

    return { totalRevenue, totalOrders, totalItems, avgCheck, productStats, tableStats, shashlikByTable };
  }, [filteredOrders, products]);

  // 7 kunlik chart (kunlik tanlanganda)
  const chartData = useMemo(() => {
    const days = period === "yillik" ? 12 : period === "oylik" ? 30 : 7;
    return Array.from({ length: days }, (_, i) => {
      const d = subDays(new Date(), days - 1 - i);
      const start = startOfDay(d);
      const end = endOfDay(d);
      const total = orders
        .filter((o) => isWithinInterval(new Date(o.closedAt || o.createdAt), { start, end }))
        .reduce((s, o) => s + o.total, 0);
      return {
        label: format(d, period === "yillik" ? "MMM" : "dd.MM"),
        value: total,
      };
    });
  }, [orders, period]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Hisobot</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Sohil choyxona savdo statistikasi
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-[#111D35] border border-[#1E3558] rounded-xl">
          {(["kunlik", "oylik", "yillik"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                period === p
                  ? "bg-[#E2E8F0] text-[#0B0F14]"
                  : "text-[#94A3B8] hover:text-[#F1F5F9]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Coins size={18} />}
          label="Tushum"
          value={formatSom(stats.totalRevenue)}
          color="text-[#22C55E]"
        />
        <StatCard
          icon={<Receipt size={18} />}
          label="Zakazlar"
          value={`${stats.totalOrders} ta`}
        />
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Mahsulotlar"
          value={`${Math.round(stats.totalItems)} ta`}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="O'rtacha chek"
          value={formatSom(stats.avgCheck)}
        />
      </div>

      {/* Chart */}
      <div className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-[#94A3B8]" />
          <h2 className="font-semibold text-[#F1F5F9]">
            {period === "yillik" ? "Oylik" : "Kunlik"} dinamika
          </h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#273244" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: "#273244" }}
                contentStyle={{
                  background: "#0B0F14",
                  border: "1px solid #273244",
                  borderRadius: "12px",
                  color: "#E2E8F0",
                }}
                formatter={(v: number) => formatSom(v)}
              />
              <Bar dataKey="value" fill="#22C55E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mahsulot bo'yicha */}
        <div className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-4 md:p-6">
          <h2 className="font-semibold text-[#F1F5F9] mb-4">Eng ko'p sotilganlar</h2>
          {stats.productStats.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">Hali sotuvlar yo'q</div>
          ) : (
            <div className="space-y-2">
              {stats.productStats.slice(0, 10).map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 p-3 bg-[#0C1628] border border-[#1E3558] rounded-xl"
                >
                  <div className="w-6 text-center text-[#64748B] text-sm font-mono">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#F1F5F9] truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {p.qty % 1 === 0 ? p.qty : p.qty.toFixed(2)} ta/kg
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#22C55E]">
                    {formatSom(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stol bo'yicha */}
        <div className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-4 md:p-6">
          <h2 className="font-semibold text-[#F1F5F9] mb-4">Stollar bo'yicha</h2>
          {stats.tableStats.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">Hali sotuvlar yo'q</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {stats.tableStats.map((t, i) => (
                <div
                  key={t.name}
                  className="flex items-center gap-3 p-3 bg-[#0C1628] border border-[#1E3558] rounded-xl"
                >
                  <div className="w-6 text-center text-[#64748B] text-sm font-mono">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#F1F5F9]">{t.name}</div>
                    <div className="text-xs text-[#64748B]">{t.orders} ta zakaz</div>
                  </div>
                  <div className="text-sm font-semibold text-[#22C55E]">
                    {formatSom(t.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shashlik bo'yicha (alohida) */}
      <div className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-4 md:p-6">
        <h2 className="font-semibold text-[#F1F5F9] mb-1">🍢 Shashlik — stol bo'yicha</h2>
        <p className="text-xs text-[#64748B] mb-4">
          Bugun (yoki tanlangan davrda) qaysi stolga qancha shashlik sotilgan
        </p>
        {Object.keys(stats.shashlikByTable).length === 0 ? (
          <div className="text-center py-8 text-[#64748B]">Shashlik sotilmagan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E3558] text-[#94A3B8]">
                  <th className="text-left p-2 font-medium">Stol</th>
                  <th className="text-right p-2 font-medium">Qiyma</th>
                  <th className="text-right p-2 font-medium">Go'sht</th>
                  <th className="text-right p-2 font-medium">Qo'y</th>
                  <th className="text-right p-2 font-medium">Jami</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.shashlikByTable).map(([table, items]) => {
                  const qiyma = items["Qiyma shashlik"] || 0;
                  const gosht = items["Go'sht shashlik"] || 0;
                  const qoy = items["Qo'y go'shti shashlik"] || 0;
                  const total = qiyma + gosht + qoy;
                  return (
                    <tr key={table} className="border-b border-[#1E3558]/50">
                      <td className="p-2 text-[#F1F5F9]">{table}</td>
                      <td className="p-2 text-right">{qiyma || "—"}</td>
                      <td className="p-2 text-right">{gosht || "—"}</td>
                      <td className="p-2 text-right">{qoy || "—"}</td>
                      <td className="p-2 text-right font-semibold text-[#22C55E]">
                        {total} dona
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Oxirgi zakazlar */}
      <div className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-4 md:p-6">
        <h2 className="font-semibold text-[#F1F5F9] mb-4">Oxirgi yopilgan zakazlar</h2>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-[#64748B]">Zakazlar yo'q</div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredOrders.slice(0, 20).map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 p-3 bg-[#0C1628] border border-[#1E3558] rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#F1F5F9]">{o.tableName}</div>
                  <div className="text-xs text-[#64748B]">
                    {o.items.length} mahsulot · {format(new Date(o.closedAt || o.createdAt), "dd.MM HH:mm")}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#22C55E]">
                  {formatSom(o.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color = "text-[#F1F5F9]",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-4">
      <div className="flex items-center gap-2 text-[#94A3B8] text-xs mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("text-lg md:text-xl font-bold", color)}>{value}</div>
    </div>
  );
}
