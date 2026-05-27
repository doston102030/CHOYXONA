"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Order } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatDate, formatSom } from "@/lib/utils";
import { Trash2, Eye, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function OrdersHistoryPage() {
  const allOrders = useAppStore((s) => s.orders);
  const activeOrders = useAppStore((s) => s.activeOrders);
  const deleteOrder = useAppStore((s) => s.deleteOrder);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ochiq" | "yopildi" | "bekor">("all");
  const [viewing, setViewing] = useState<Order | null>(null);

  const combined = useMemo(
    () => [...activeOrders, ...allOrders].sort((a, b) =>
      (b.closedAt || b.createdAt).localeCompare(a.closedAt || a.createdAt)
    ),
    [activeOrders, allOrders]
  );

  const filtered = useMemo(() => {
    let list = combined;
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.tableName.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.waiterName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [combined, filter, search]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Zakazlar tarixi</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Barcha zakazlarni ko'rish va o'chirish
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Stol nomi, ofitsiant yoki ID bo'yicha qidirish..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 p-1 bg-[#111D35] border border-[#1E3558] rounded-xl">
          {(["all", "ochiq", "yopildi", "bekor"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-[#E2E8F0] text-[#0B0F14]"
                  : "text-[#94A3B8] hover:text-[#F1F5F9]"
              }`}
            >
              {f === "all" ? "Hammasi" : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#64748B] bg-[#111D35] border border-[#1E3558] rounded-2xl">
          Zakazlar topilmadi
        </div>
      ) : (
        <div className="bg-[#111D35] border border-[#1E3558] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0C1628] text-[#94A3B8]">
                <tr>
                  <th className="text-left p-3 font-medium">Stol</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">
                    Ofitsiant
                  </th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">
                    Sana
                  </th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Summa</th>
                  <th className="text-right p-3 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-[#1E3558] hover:bg-[#0C1628]/50"
                  >
                    <td className="p-3 text-[#F1F5F9] font-medium">{o.tableName}</td>
                    <td className="p-3 text-[#94A3B8] hidden sm:table-cell">
                      {o.waiterName || "—"}
                    </td>
                    <td className="p-3 text-[#94A3B8] hidden md:table-cell">
                      {formatDate(o.closedAt || o.createdAt)}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-3 text-right font-semibold text-[#22C55E]">
                      {formatSom(o.total)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => setViewing(o)}
                          className="p-1.5 text-[#94A3B8] hover:bg-[#0C1628] rounded-lg"
                          title="Ko'rish"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                `${o.tableName} zakazini o'chirasizmi? Bu amalni qaytarib bo'lmaydi.`
                              )
                            ) {
                              try {
                                await deleteOrder(o.id);
                                toast.success("O'chirildi");
                              } catch (e: any) {
                                toast.error("Xato: " + (e?.message ?? ""));
                              }
                            }
                          }}
                          className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg"
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 200 && (
            <div className="p-3 text-center text-xs text-[#64748B] border-t border-[#1E3558]">
              Faqat oxirgi 200 ta zakaz ko'rsatilmoqda
            </div>
          )}
        </div>
      )}

      {/* Ko'rish modali */}
      {viewing && (
        <Modal isOpen={true} onClose={() => setViewing(null)} title={`${viewing.tableName} — zakaz`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="ID" value={viewing.id.slice(-8).toUpperCase()} />
              <Info label="Status" value={viewing.status} />
              <Info label="Ofitsiant" value={viewing.waiterName || "—"} />
              <Info label="Sana" value={formatDate(viewing.closedAt || viewing.createdAt)} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#94A3B8] mb-2">
                Mahsulotlar ({viewing.items.length})
              </h3>
              <div className="space-y-1.5">
                {viewing.items.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between p-2.5 bg-[#0C1628] border border-[#1E3558] rounded-lg text-sm"
                  >
                    <span className="text-[#F1F5F9]">{i.productName}</span>
                    <div className="text-right">
                      <div className="text-xs text-[#64748B]">
                        {i.weight !== undefined ? `${i.weight} kg` : `${i.quantity} dona`}
                      </div>
                      <div className="font-semibold text-[#F1F5F9]">
                        {formatSom(i.subtotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#0C1628] border border-[#1E3558] rounded-xl space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Mahsulotlar:</span>
                <span>{formatSom(viewing.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Xizmat haqi ({viewing.servicePercent}%):</span>
                <span>{formatSom(viewing.serviceFee)}</span>
              </div>
              <div className="border-t border-[#1E3558] pt-1.5 flex justify-between font-semibold">
                <span>Jami:</span>
                <span className="text-[#22C55E]">{formatSom(viewing.total)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ochiq: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
    yopildi: "bg-[#64748B]/10 text-[#94A3B8] border-[#1E3558]",
    bekor: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-md border ${map[status] || ""}`}>
      {status}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 bg-[#0C1628] border border-[#1E3558] rounded-lg">
      <div className="text-xs text-[#64748B]">{label}</div>
      <div className="text-sm text-[#F1F5F9] font-medium mt-0.5">{value}</div>
    </div>
  );
}
