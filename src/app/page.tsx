"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { TableGrid } from "@/components/TableGrid";
import { OrderScreen } from "@/components/OrderScreen";
import { WaiterPinScreen } from "@/components/WaiterPinScreen";
import { Settings, LogOut, Wifi, WifiOff } from "lucide-react";
import { formatSom } from "@/lib/utils";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const currentTableId = useAppStore((s) => s.currentTableId);
  const openTable = useAppStore((s) => s.openTable);
  const closeTableView = useAppStore((s) => s.closeTableView);
  const activeOrders = useAppStore((s) => s.activeOrders);
  const isInitialized = useAppStore((s) => s.isInitialized);
  const isOnline = useAppStore((s) => s.isOnline);
  const waiters = useAppStore((s) => s.waiters);

  const waiterId = useAuthStore((s) => s.waiterId);
  const waiterName = useAuthStore((s) => s.waiterName);
  const clearWaiter = useAuthStore((s) => s.clearWaiter);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C1628]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
          <div className="text-[#475569] text-sm">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  // Agar ofitsiantlar bor bo'lsa va tanlanmagan bo'lsa, PIN kerak
  if (waiters.length > 0 && !waiterId) {
    return <WaiterPinScreen />;
  }

  if (currentTableId) {
    return <OrderScreen tableId={currentTableId} onBack={closeTableView} />;
  }

  const totalActive = activeOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-[#0C1628]">
      <header className="sticky top-0 z-10 bg-[#0C1628]/95 backdrop-blur-md border-b border-[#1E3558]">
        <div className="px-4 py-3.5 flex items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold text-[#F1F5F9] truncate tracking-tight">
              🍵 Sohil Choyxona
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {waiterName && (
                <p className="text-xs text-[#60A5FA] font-medium">👤 {waiterName}</p>
              )}
              <div className="flex items-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Wifi size={11} className="text-[#22C55E]" />
                    <span className="hidden sm:inline text-[#22C55E] font-medium">Onlayn</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={11} className="text-[#F59E0B]" />
                    <span className="hidden sm:inline text-[#F59E0B] font-medium">Mahalliy</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeOrders.length > 0 && (
              <div className="hidden md:flex flex-col items-end px-3 py-1.5 bg-[#0D2B1A] border border-[#22C55E]/30 rounded-xl">
                <div className="text-xs text-[#86EFAC] font-medium">{activeOrders.length} ta ochiq</div>
                <div className="text-xs font-bold text-[#22C55E]">
                  {formatSom(totalActive)}
                </div>
              </div>
            )}
            {waiterId && (
              <button
                onClick={clearWaiter}
                title="Ofitsiant almashtirish"
                className="flex items-center gap-1 px-3 py-2 bg-[#131F38] border border-[#1E3558] rounded-xl hover:border-[#2D5490] transition-all"
              >
                <LogOut size={14} className="text-[#64748B]" />
              </button>
            )}
            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-3 py-2 bg-[#131F38] border border-[#1E3558] rounded-xl hover:border-[#2D5490] hover:bg-[#1A2844] transition-all"
            >
              <Settings size={14} className="text-[#64748B]" />
              <span className="text-xs font-semibold text-[#94A3B8] hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <TableGrid onTableClick={openTable} />
      </main>
    </div>
  );
}
