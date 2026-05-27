"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Table, TableType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABEL: Record<TableType, string> = {
  oddiy: "Oddiy xona",
  sori: "So'ri",
  ustol: "Ustol",
  katta: "Katta xona (tepa)",
};

const TYPES: TableType[] = ["oddiy", "sori", "ustol", "katta"];

export default function TablesPage() {
  const tables = useAppStore((s) => s.tables);
  const addTable = useAppStore((s) => s.addTable);
  const updateTable = useAppStore((s) => s.updateTable);
  const deleteTable = useAppStore((s) => s.deleteTable);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);

  const grouped = TYPES.map((type) => ({
    type,
    items: tables.filter((t) => t.type === type).sort((a, b) => a.order - b.order),
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Stollar</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Xonalar, so'rilar, ustollarni boshqarish
          </p>
        </div>
        <Button variant="success" onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" />
          Yangi stol qo'shish
        </Button>
      </div>

      {grouped.map((group) => (
        <section key={group.type}>
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">
            {TYPE_LABEL[group.type]} ({group.items.length})
          </h2>
          {group.items.length === 0 ? (
            <div className="text-sm text-[#64748B] p-4 bg-[#111D35] border border-[#1E3558] rounded-xl">
              Bu turdagi stollar yo'q
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {group.items.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-[#F1F5F9]">{t.name}</div>
                    <button
                      onClick={() => updateTable(t.id, { isActive: !t.isActive })}
                    >
                      {t.isActive ? (
                        <ToggleRight size={18} className="text-[#22C55E]" />
                      ) : (
                        <ToggleLeft size={18} className="text-[#64748B]" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(t)}
                      className="flex-1 p-1.5 text-[#94A3B8] hover:bg-[#0C1628] rounded-lg"
                    >
                      <Pencil size={14} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${t.name}" o'chirilsinmi?`)) {
                          deleteTable(t.id);
                          toast.success("O'chirildi");
                        }
                      }}
                      className="flex-1 p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg"
                    >
                      <Trash2 size={14} className="mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {(showAdd || editing) && (
        <TableFormModal
          table={editing}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSave={async (name, type) => {
            try {
              if (editing) {
                await updateTable(editing.id, { name, type });
                toast.success("Yangilandi");
              } else {
                await addTable(name, type);
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

function TableFormModal({
  table,
  onClose,
  onSave,
}: {
  table: Table | null;
  onClose: () => void;
  onSave: (name: string, type: TableType) => void;
}) {
  const [name, setName] = useState(table?.name ?? "");
  const [type, setType] = useState<TableType>(table?.type ?? "oddiy");

  const submit = () => {
    if (!name.trim()) return toast.error("Nom kiriting");
    onSave(name.trim(), type);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={table ? "Stolni tahrirlash" : "Yangi stol"}
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="Stol nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masalan: Xona 8"
          autoFocus
        />

        <div>
          <label className="block text-sm text-[#94A3B8] mb-1.5">Turi</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                  type === t
                    ? "bg-[#E2E8F0] text-[#0B0F14] font-medium"
                    : "bg-[#0C1628] border border-[#1E3558] text-[#94A3B8] hover:text-[#F1F5F9]"
                }`}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

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
