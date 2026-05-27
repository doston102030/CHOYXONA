"use client";

import { Table } from "@/types";
import { cn, formatSom } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Users, Sofa, Square, Crown } from "lucide-react";

const TYPE_LABEL: Record<Table["type"], string> = {
  sori: "So'rilar",
  oddiy: "Xonalar",
  katta: "Katta xonalar",
  ustol: "Ustollar",
};

const TYPE_ICON = {
  sori: Sofa,
  oddiy: Users,
  katta: Crown,
  ustol: Square,
};

// Section header ranglari (faqat sarlavha uchun)
const TYPE_SECTION_COLOR: Record<Table["type"], { icon: string; text: string; badge: string }> = {
  sori:  { icon: "text-[#F87171]", text: "text-[#F87171]", badge: "bg-[#2D0A0A] border-[#7F1D1D]" },
  oddiy: { icon: "text-[#F87171]", text: "text-[#F87171]", badge: "bg-[#2D0A0A] border-[#7F1D1D]" },
  katta: { icon: "text-[#F87171]", text: "text-[#F87171]", badge: "bg-[#2D0A0A] border-[#7F1D1D]" },
  ustol: { icon: "text-[#F87171]", text: "text-[#F87171]", badge: "bg-[#2D0A0A] border-[#7F1D1D]" },
};

const TYPE_ORDER: Table["type"][] = ["sori", "oddiy", "katta", "ustol"];

interface TableGridProps {
  onTableClick: (tableId: string) => void;
}

export function TableGrid({ onTableClick }: TableGridProps) {
  const tables = useAppStore((s) => s.tables.filter((t) => t.isActive));
  const activeOrders = useAppStore((s) => s.activeOrders);

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    items: tables
      .filter((t) => t.type === type)
      .sort((a, b) => a.order - b.order),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-10">
      {grouped.map((group) => {
        const Icon = TYPE_ICON[group.type];
        const sc = TYPE_SECTION_COLOR[group.type];
        const occupied = group.items.filter((t) =>
          activeOrders.some((o) => o.tableId === t.id)
        ).length;

        return (
          <section key={group.type}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5 px-1">
              <div className={cn("p-1.5 rounded-lg border", sc.badge)}>
                <Icon size={15} className={sc.icon} />
              </div>
              <h2 className={cn("text-sm font-extrabold uppercase tracking-widest", sc.text)}>
                {TYPE_LABEL[group.type]}
              </h2>
              {occupied > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] text-xs font-bold">
                  {occupied} band
                </span>
              )}
              <div className="flex-1 h-px bg-[#1A2F50] ml-1" />
              <span className="text-xs text-[#334155]">{group.items.length} ta</span>
            </div>

            {/* Cards — barcha turlar bir xil rang */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {group.items.map((table) => {
                const order = activeOrders.find((o) => o.tableId === table.id);
                const isOccupied = !!order;

                if (isOccupied) {
                  return (
                    <button
                      key={table.id}
                      onClick={() => onTableClick(table.id)}
                      className="relative overflow-hidden p-5 rounded-2xl border-2 border-[#22C55E]/60 bg-gradient-to-br from-[#0D2B1A] to-[#071610] hover:border-[#22C55E] hover:shadow-lg hover:shadow-[#22C55E]/15 transition-all active:scale-[0.96] text-left"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/5 rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
                      <span className="absolute top-3 right-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E] block" />
                      </span>
                      <div className="font-bold text-[#F0FDF4] text-base">{table.name}</div>
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-[#86EFAC] font-medium">{order.items.length} mahsulot</div>
                        <div className="text-lg font-extrabold text-[#22C55E]">{formatSom(order.total)}</div>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={table.id}
                    onClick={() => onTableClick(table.id)}
                    className="relative overflow-hidden p-5 rounded-2xl border-2 border-[#1A2F50] bg-[#0D1628] hover:border-[#2D5490] hover:bg-[#111E38] transition-all active:scale-[0.96] text-left group"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.015] rounded-full -translate-y-8 translate-x-8 pointer-events-none group-hover:bg-white/[0.03] transition-all" />
                    <div className="font-bold text-base text-[#CBD5E1]">{table.name}</div>
                    <div className="text-xs mt-2 font-medium text-[#334155]">Bo'sh</div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {grouped.length === 0 && (
        <div className="text-center py-20 text-[#334155]">
          Stollar yo'q. Admin paneldan stol qo'shing.
        </div>
      )}
    </div>
  );
}
