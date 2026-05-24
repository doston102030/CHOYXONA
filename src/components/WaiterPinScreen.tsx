"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Delete, User } from "lucide-react";

export function WaiterPinScreen() {
  const [pin, setPin] = useState("");
  const waiters = useAppStore((s) => s.waiters);
  const findWaiterByPin = useAppStore((s) => s.findWaiterByPin);
  const setWaiter = useAuthStore((s) => s.setWaiter);

  useEffect(() => {
    if (pin.length === 4) {
      const w = findWaiterByPin(pin);
      if (w) {
        setWaiter(w.id, w.name);
        toast.success(`Xush kelibsiz, ${w.name}`);
      } else {
        toast.error("PIN noto'g'ri");
        setTimeout(() => setPin(""), 300);
      }
    }
  }, [pin, findWaiterByPin, setWaiter]);

  const press = (n: string) => {
    if (pin.length < 4) setPin(pin + n);
  };
  const back = () => setPin(pin.slice(0, -1));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1A1F2B] border border-[#273244] mb-3">
            <User size={22} className="text-[#94A3B8]" />
          </div>
          <h1 className="text-xl font-bold text-[#E2E8F0]">Sohil Choyxona</h1>
          <p className="text-sm text-[#64748B] mt-1">PIN kodingizni kiriting</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                pin.length > i ? "bg-[#22C55E] scale-110" : "bg-[#273244]"
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => press(String(n))}
              className="h-16 bg-[#1A1F2B] border border-[#273244] rounded-2xl text-2xl font-semibold text-[#E2E8F0] hover:border-[#64748B] active:scale-95 transition-all"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => press("0")}
            className="h-16 bg-[#1A1F2B] border border-[#273244] rounded-2xl text-2xl font-semibold text-[#E2E8F0] hover:border-[#64748B] active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={back}
            className="h-16 bg-[#1A1F2B] border border-[#273244] rounded-2xl flex items-center justify-center text-[#94A3B8] hover:border-[#64748B] active:scale-95 transition-all"
          >
            <Delete size={22} />
          </button>
        </div>

        {waiters.length === 0 && (
          <div className="mt-6 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl text-xs text-[#F59E0B] text-center">
            Ofitsiantlar qo'shilmagan. Admin paneldan qo'shing.
          </div>
        )}
      </div>
    </div>
  );
}
