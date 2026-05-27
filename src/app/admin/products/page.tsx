"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Product, ProductCategory } from "@/types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/constants";
import { formatSom } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES: ProductCategory[] = [
  "asosiy",
  "salat",
  "qoshimcha",
  "ichimlik",
  "shashlik",
  "maxsus",
];

export default function ProductsPage() {
  const products = useAppStore((s) => s.products);
  const addProduct = useAppStore((s) => s.addProduct);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const deleteProduct = useAppStore((s) => s.deleteProduct);

  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");

  const filtered =
    filterCat === "all" ? products : products.filter((p) => p.category === filterCat);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Mahsulotlar</h1>
          <p className="text-sm text-[#64748B] mt-1">Menyuni boshqarish</p>
        </div>
        <Button variant="success" onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" />
          Yangi qo'shish
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterBtn active={filterCat === "all"} onClick={() => setFilterCat("all")}>
          Hammasi
        </FilterBtn>
        {CATEGORIES.map((c) => (
          <FilterBtn key={c} active={filterCat === c} onClick={() => setFilterCat(c)}>
            {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
          </FilterBtn>
        ))}
      </div>

      {/* Mahsulotlar ro'yxati */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-[#111D35] border border-[#1E3558] rounded-2xl p-4 group"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#64748B] mb-1">
                  {CATEGORY_ICONS[p.category]} {CATEGORY_LABELS[p.category]}
                </div>
                <div className="font-semibold text-[#F1F5F9] truncate">{p.name}</div>
              </div>
              <button
                onClick={() => updateProduct(p.id, { isActive: !p.isActive })}
                title={p.isActive ? "Yoqilgan" : "O'chirilgan"}
              >
                {p.isActive ? (
                  <ToggleRight size={22} className="text-[#22C55E]" />
                ) : (
                  <ToggleLeft size={22} className="text-[#64748B]" />
                )}
              </button>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-lg font-bold text-[#22C55E]">
                {formatSom(p.isVariableWeight ? (p.pricePerKg ?? p.price) : p.price)}
              </span>
              {p.isVariableWeight && (
                <span className="text-xs text-[#64748B]">/ kg</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditing(p)}
                className="flex-1"
              >
                <Pencil size={14} className="mr-1" />
                Tahrirlash
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(`"${p.name}" o'chirilsinmi?`)) {
                    deleteProduct(p.id);
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

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[#64748B]">Bu kategoriyada mahsulot yo'q</div>
      )}

      {/* Add / Edit Modal */}
      {(showAdd || editing) && (
        <ProductFormModal
          product={editing}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSave={async (data) => {
            try {
              if (editing) {
                await updateProduct(editing.id, data);
                toast.success("Yangilandi");
              } else {
                await addProduct({ ...data, isActive: true });
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

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
        active
          ? "bg-[#E2E8F0] text-[#0B0F14]"
          : "bg-[#111D35] border border-[#1E3558] text-[#94A3B8] hover:text-[#F1F5F9]"
      }`}
    >
      {children}
    </button>
  );
}

function ProductFormModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "asosiy");
  const [isVariableWeight, setIsVariableWeight] = useState(
    product?.isVariableWeight ?? false
  );
  const [pricePerKg, setPricePerKg] = useState(String(product?.pricePerKg ?? ""));

  const submit = () => {
    if (!name.trim()) return toast.error("Nom kiriting");
    const p = parseInt(isVariableWeight ? pricePerKg : price);
    if (!p || p <= 0) return toast.error("To'g'ri narx kiriting");

    onSave({
      name: name.trim(),
      price: p,
      category,
      isVariableWeight,
      pricePerKg: isVariableWeight ? p : undefined,
      unit: isVariableWeight ? "kg" : "dona",
      isActive: product?.isActive ?? true,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masalan: Lavash"
          autoFocus
        />

        <div>
          <label className="block text-sm text-[#94A3B8] mb-1.5">Kategoriya</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                  category === c
                    ? "bg-[#E2E8F0] text-[#0B0F14] font-medium"
                    : "bg-[#0C1628] border border-[#1E3558] text-[#94A3B8] hover:text-[#F1F5F9]"
                }`}
              >
                <div className="text-base">{CATEGORY_ICONS[c]}</div>
                <div className="text-xs mt-0.5">{CATEGORY_LABELS[c]}</div>
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 p-3 bg-[#0C1628] border border-[#1E3558] rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={isVariableWeight}
            onChange={(e) => setIsVariableWeight(e.target.checked)}
            className="w-4 h-4 accent-[#22C55E]"
          />
          <div className="flex-1">
            <div className="text-sm text-[#F1F5F9] font-medium">
              Kg bo'yicha sotiladi
            </div>
            <div className="text-xs text-[#64748B]">
              Kanotcha, o'rdak go'shti kabi
            </div>
          </div>
        </label>

        <Input
          label={isVariableWeight ? "Narxi (1 kg uchun, so'm)" : "Narxi (1 dona, so'm)"}
          type="number"
          value={isVariableWeight ? pricePerKg : price}
          onChange={(e) =>
            isVariableWeight ? setPricePerKg(e.target.value) : setPrice(e.target.value)
          }
          placeholder="20000"
        />

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
