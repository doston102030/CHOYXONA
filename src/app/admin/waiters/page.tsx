"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Waiter } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, User } from "lucide-react";
import { toast } from "sonner";

export default function WaitersPage() {
  const waiters = useAppStore((s) => s.waiters);
  const addWaiter = useAppStore((s) => s.addWaiter);
  const updateWaiter = useAppStore((s) => s.updateWaiter);
  const deleteWaiter = useAppStore((s) => s.deleteWaiter);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Waiter | null>(null);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Ofitsiantlar</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Ofitsiantlar 4 raqamli PIN bilan tizimga kiradi
          </p>
        </div>
        <Button variant="success" onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" />
          Ofitsiant qo'shish
        </Button>
      </div>

      {waiters.length === 0 ? (
        <div className="text-center py-20 text-[#64748B] bg-[#1A1F2B] border border-[#273244] rounded-2xl">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          Hali ofitsiantlar qo'shilmagan
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {waiters.map((w) => (
            <div
              key={w.id}
              className="bg-[#1A1F2B] border border-[#273244] rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-[#E2E8F0]">{w.name}</div>
                  <div className="text-xs text-[#64748B] mt-1">
                    PIN: <span className="font-mono text-[#94A3B8]">{w.pin}</span>
                  </div>
                </div>
                <button
                  onClick={() => updateWaiter(w.id, { isActive: !w.isActive })}
                  title={w.isActive ? "Yoqilgan" : "O'chirilgan"}
                >
                  {w.isActive ? (
                    <ToggleRight size={20} className="text-[#22C55E]" />
                  ) : (
                    <ToggleLeft size={20} className="text-[#64748B]" />
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(w)}
                  className="flex-1"
                >
                  <Pencil size={14} className="mr-1" />
                  Tahrirlash
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`"${w.name}" o'chirilsinmi?`)) {
                      deleteWaiter(w.id);
                      toast.success("O'chirildi");
                    }
                  }}
                  className="text-[#EF4444] hover:bg-[#EF4444]/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAdd || editing) && (
        <WaiterFormModal
          waiter={editing}
          existingPins={waiters
            .filter((w) => w.id !== editing?.id)
            .map((w) => w.pin)}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSave={async (name, pin) => {
            try {
              if (editing) {
                await updateWaiter(editing.id, { name, pin });
                toast.success("Yangilandi");
              } else {
                await addWaiter(name, pin);
                toast.success("Qo'shildi");
              }
              setShowAdd(false);
              setEditing(null);
            } catch (e: any) {
              toast.error("Xato: " + (e?.message ?? ""));
            }
          }}
        />
      )}
    </div>
  );
}

function WaiterFormModal({
  waiter,
  existingPins,
  onClose,
  onSave,
}: {
  waiter: Waiter | null;
  existingPins: string[];
  onClose: () => void;
  onSave: (name: string, pin: string) => void;
}) {
  const [name, setName] = useState(waiter?.name ?? "");
  const [pin, setPin] = useState(waiter?.pin ?? "");

  const submit = () => {
    if (!name.trim()) return toast.error("Nom kiriting");
    if (!/^\d{4}$/.test(pin)) return toast.error("PIN — 4 ta raqam");
    if (existingPins.includes(pin))
      return toast.error("Bu PIN allaqachon ishlatilgan");
    onSave(name.trim(), pin);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={waiter ? "Ofitsiantni tahrirlash" : "Yangi ofitsiant"}
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="Ismi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masalan: Aziz"
          autoFocus
        />
        <Input
          label="PIN (4 raqam)"
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          placeholder="1234"
          inputMode="numeric"
          maxLength={4}
        />
        <p className="text-xs text-[#64748B]">
          Ofitsiant tizimga kirish uchun shu 4 raqamli kodni kiritadi
        </p>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Bekor
          </Button>
          <Button variant="success" onClick={submit} className="flex-1">
            Saqlash
          </Button>
        </div>
      </div>
    </Modal>
  );
}
