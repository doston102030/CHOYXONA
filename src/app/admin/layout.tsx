"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Sofa,
  Menu,
  X,
  Users,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Zakazlar", icon: Receipt },
  { href: "/admin/products", label: "Mahsulotlar", icon: Package },
  { href: "/admin/tables", label: "Stollar", icon: Sofa },
  { href: "/admin/waiters", label: "Ofitsiantlar", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (pathname === "/admin/login") {
    router.replace("/admin");
    return null;
  }


  return (
    <div className="min-h-screen bg-[#0C1628] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[#1E3558] bg-[#070C18] sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-[#1E3558]">
          <div className="text-base font-extrabold text-[#F1F5F9] tracking-tight">🍵 Sohil Admin</div>
          <div className="text-xs text-[#475569] mt-0.5 font-medium">Boshqaruv paneli</div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  active
                    ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/25"
                    : "text-[#64748B] hover:bg-[#111D35] hover:text-[#CBD5E1]"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1E3558]">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#475569] hover:bg-[#111D35] hover:text-[#CBD5E1] transition-all"
          >
            ← Ofitsiant ekrani
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#070C18] border-b border-[#1E3558] flex items-center justify-between p-4">
        <h1 className="text-base font-extrabold text-[#F1F5F9]">🍵 Sohil Admin</h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-[#111D35]"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 bottom-0 w-72 bg-[#0C1628] border-l border-[#1E3558] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#1E3558] flex items-center justify-between">
              <h2 className="font-bold text-[#E2E8F0]">Menyu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-[#111D35]"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                      active
                        ? "bg-[#111D35] text-[#E2E8F0] border border-[#1E3558]"
                        : "text-[#94A3B8] hover:bg-[#111D35]"
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[#1E3558] space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94A3B8] hover:bg-[#111D35]"
              >
                ← Ofitsiant ekrani
              </Link>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden bg-[#0C1628]">
        {children}
      </main>
    </div>
  );
}
