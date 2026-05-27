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
    <div className="space-y-8">
      {grouped.map((group) => {
        const Icon = TYPE_ICON[group.type];
        const occupied = group.items.filter((t) =>
          activeOrders.some((o) => o.tableId === t.id)
        ).length;

        return (
          <section key={group.type}>
            {/* Section header — minimal, red */}
            <div className="flex items-center gap-2.5 mb-4">
              <Icon size={14} className="text-[#F87171]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#F87171]">
                {TYPE_LABEL[group.type]}
              </h2>
              {occupied > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/25 text-[#22C55E] text-xs font-semibold">
                  {occupied} band
                </span>
              )}
              <div className="flex-1 h-px bg-[#162035]" />
              <span className="text-xs text-[#2D4060]">{group.items.length} ta</span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {group.items.map((table) => {
                const order = activeOrders.find((o) => o.tableId === table.id);
                const isOccupied = !!order;

                if (isOccupied) {
                  return (
                    <button
                      key={table.id}
                      onClick={() => onTableClick(table.id)}
                      className="relative p-4 rounded-xl border border-[#22C55E]/50 bg-[#071A10] hover:border-[#22C55E] hover:bg-[#091F13] transition-all active:scale-[0.97] text-left"
                    >
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#22C55E] animate-pulse block" />
                      <div className="font-semibold text-[#E2FFE8] text-sm">{table.name}</div>
                      <div className="mt-2.5 space-y-0.5">
                        <div className="text-xs text-[#4ADE80]/70">{order.items.length} mahsulot</div>
                        <div className="text-base font-bold text-[#22C55E]">{formatSom(order.total)}</div>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={table.id}
                    onClick={() => onTableClick(table.id)}
                    className="p-4 rounded-xl border border-[#EF4444]/30 bg-[#150808] hover:border-[#EF4444]/60 hover:bg-[#1A0A0A] transition-all active:scale-[0.97] text-left"
                  >
                    <div className="font-semibold text-sm text-[#E2C8C8]">{table.name}</div>
                    <div className="text-xs mt-2 font-medium text-[#EF4444]/50">Bo'sh</div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {grouped.length === 0 && (
        <div className="text-center py-20 text-[#2D4060]">
          Stollar yo'q. Admin paneldan stol qo'shing.
        </div>
      )}
    </div>
  );
}
