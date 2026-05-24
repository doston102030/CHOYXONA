"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Product, Order } from "@/types";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/constants";
import { cn, formatSom } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Printer, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Receipt } from "@/components/Receipt";

interface OrderScreenProps {
  tableId: string;
  onBack: () => void;
}

const CAT_COLOR: Record<string, { active: string; dot: string }> = {
  asosiy:    { active: "bg-[#F59E0B] border-[#F59E0B] text-[#0C1628] shadow-[#F59E0B]/30", dot: "bg-[#F59E0B]" },
  salat:     { active: "bg-[#22C55E] border-[#22C55E] text-[#0C1628] shadow-[#22C55E]/30", dot: "bg-[#22C55E]" },
  qoshimcha: { active: "bg-[#EF4444] border-[#EF4444] text-white shadow-[#EF4444]/30",      dot: "bg-[#EF4444]" },
  ichimlik:  { active: "bg-[#3B82F6] border-[#3B82F6] text-white shadow-[#3B82F6]/30",     dot: "bg-[#3B82F6]" },
  shashlik:  { active: "bg-[#F97316] border-[#F97316] text-white shadow-[#F97316]/30",     dot: "bg-[#F97316]" },
  maxsus:    { active: "bg-[#A855F7] border-[#A855F7] text-white shadow-[#A855F7]/30",     dot: "bg-[#A855F7]" },
};

export function OrderScreen({ tableId, onBack }: OrderScreenProps) {
  const table        = useAppStore((s) => s.tables.find((t) => t.id === tableId));
  const products     = useAppStore((s) => s.products.filter((p) => p.isActive));
  const cart         = useAppStore((s) => s.cart);
  const addToCart    = useAppStore((s) => s.addToCart);
  const updateCartItem   = useAppStore((s) => s.updateCartItem);
  const removeFromCart   = useAppStore((s) => s.removeFromCart);
  const saveOrderForTable    = useAppStore((s) => s.saveOrderForTable);
  const closeOrder           = useAppStore((s) => s.closeOrder);
  const cancelOrder          = useAppStore((s) => s.cancelOrder);
  const getActiveOrderForTable = useAppStore((s) => s.getActiveOrderForTable);

  const waiterId   = useAuthStore((s) => s.waiterId);
  const waiterName = useAuthStore((s) => s.waiterName);

  const SERVICE_PERCENT = 1;

  const [activeCategory, setActiveCategory] = useState<string>("asosiy");
  const [showCart,    setShowCart]    = useState(false);
  const [weightProduct, setWeightProduct] = useState<Product | null>(null);
  const [weightInput,   setWeightInput]   = useState("1");
  const [receiptOrder,  setReceiptOrder]  = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  const filtered  = products.filter((p) => p.category === activeCategory);
  const subtotal  = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const serviceFee = Math.round((subtotal * SERVICE_PERCENT) / 100);
  const total     = subtotal + serviceFee;
  const activeOrder = getActiveOrderForTable(tableId);

  if (!table) {
    return (
      <div className="p-6 text-center text-[#94A3B8]">
        Stol topilmadi.{" "}
        <button onClick={onBack} className="underline">Orqaga</button>
      </div>
    );
  }

  const handleBack = async () => {
    if (cart.length > 0) {
      try { await saveOrderForTable(waiterId ?? undefined, waiterName ?? undefined); } catch {}
    }
    onBack();
  };

  const handleAdd = (product: Product) => {
    if (product.isVariableWeight) {
      setWeightProduct(product);
      setWeightInput("1");
      return;
    }
    addToCart(product, 1);
  };

  const handleAddWeight = () => {
    if (!weightProduct) return;
    const w = parseFloat(weightInput.replace(",", "."));
    if (isNaN(w) || w <= 0) return toast.error("To'g'ri og'irlik kiriting");
    addToCart(weightProduct, 1, w);
    toast.success(`${weightProduct.name} (${w} kg) qo'shildi`);
    setWeightProduct(null);
  };

  const handleSaveOrder = async () => {
    if (cart.length === 0) return toast.error("Savat bo'sh");
    setSaving(true);
    try {
      await saveOrderForTable(waiterId ?? undefined, waiterName ?? undefined);
      toast.success("Zakaz saqlandi");
      setShowCart(false);
      onBack();
    } catch (e: any) {
      toast.error("Xato: " + (e?.message ?? "saqlashda muammo"));
    } finally { setSaving(false); }
  };

  const handleCloseAndPrint = async () => {
    if (cart.length === 0) return toast.error("Savat bo'sh");
    setSaving(true);
    try {
      const order = await saveOrderForTable(waiterId ?? undefined, waiterName ?? undefined);
      if (!order) return;
      const closed = await closeOrder(order.id);
      if (closed) { setReceiptOrder(closed); setShowCart(false); }
    } catch (e: any) {
      toast.error("Xato: " + (e?.message ?? "yopishda muammo"));
    } finally { setSaving(false); }
  };

  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    if (!confirm("Bu zakazni bekor qilasizmi?")) return;
    try {
      await cancelOrder(activeOrder.id);
      toast.success("Zakaz bekor qilindi");
      setShowCart(false);
      onBack();
    } catch (e: any) {
      toast.error("Xato: " + (e?.message ?? ""));
    }
  };

  // ─── Shared cart item row ──────────────────────────────────────────────────
  const CartItems = () => (
    <div className="space-y-2">
      {cart.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3.5 bg-[#080D1A] border border-[#1A2F50] rounded-2xl"
        >
          {/* name + price */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[#E2E8F0] text-sm truncate">{item.productName}</div>
            <div className="text-xs text-[#475569] mt-0.5">
              {formatSom(item.price)}{item.weight !== undefined ? " /kg" : " /dona"}
            </div>
          </div>

          {/* qty / weight */}
          {item.weight !== undefined ? (
            <input
              type="number" step="0.1" min="0.1"
              value={item.weight}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) updateCartItem(item.id, 1, v);
              }}
              className="w-16 px-2 py-1.5 bg-[#111D35] border border-[#1E3558] rounded-xl text-center text-sm font-bold text-[#F1F5F9] focus:border-[#22C55E]"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => item.quantity > 1 ? updateCartItem(item.id, item.quantity - 1) : removeFromCart(item.id)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#111D35] border border-[#1E3558] text-[#64748B] hover:border-[#EF4444]/50 hover:text-[#EF4444] transition-all"
              ><Minus size={13} /></button>
              <span className="w-6 text-center text-sm font-extrabold text-white">{item.quantity}</span>
              <button
                onClick={() => updateCartItem(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#111D35] border border-[#1E3558] text-[#64748B] hover:border-[#22C55E]/50 hover:text-[#22C55E] transition-all"
              ><Plus size={13} /></button>
            </div>
          )}

          {/* subtotal */}
          <div className="w-24 text-right font-extrabold text-sm text-[#60A5FA] shrink-0">
            {formatSom(item.subtotal)}
          </div>

          {/* delete */}
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-[#334155] hover:text-[#EF4444] p-1.5 rounded-lg transition-all shrink-0"
          ><Trash2 size={15} /></button>
        </div>
      ))}
    </div>
  );

  // ─── Totals + action buttons ───────────────────────────────────────────────
  const CartFooter = () => (
    <div className="shrink-0 space-y-3">
      {/* totals */}
      <div className="p-4 bg-[#080D1A] border border-[#1A2F50] rounded-2xl space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Mahsulotlar:</span>
          <span className="text-[#CBD5E1] font-bold">{formatSom(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Xizmat (1%):</span>
          <span className="text-[#CBD5E1] font-bold">{formatSom(serviceFee)}</span>
        </div>
        <div className="border-t border-[#1A2F50] pt-2.5 flex justify-between items-center">
          <span className="font-bold text-[#E2E8F0] text-base">Jami:</span>
          <span className="font-extrabold text-2xl text-[#22C55E]">{formatSom(total)}</span>
        </div>
      </div>

      {/* buttons */}
      <div className="space-y-2">
        {activeOrder && (
          <button
            onClick={handleCancelOrder} disabled={saving}
            className="w-full py-3 rounded-2xl border-2 border-[#EF4444]/50 text-[#EF4444] font-bold text-sm hover:bg-[#EF4444]/10 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Trash2 size={15} /> Zakazni bekor qilish
          </button>
        )}
        <button
          onClick={handleSaveOrder} disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-[#2563EB]/20 flex items-center justify-center gap-2"
        >
          <Save size={16} /> Saqlash
        </button>
        <button
          onClick={handleCloseAndPrint} disabled={saving}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#15803D] to-[#22C55E] text-[#0C1628] font-extrabold text-base hover:opacity-90 transition-all disabled:opacity-40 shadow-xl shadow-[#22C55E]/25 flex items-center justify-center gap-2"
        >
          <Printer size={18} /> Chek & Yopish
        </button>
      </div>
    </div>
  );

  // ─── Weight input for kg products ─────────────────────────────────────────
  const weightSum = Math.round(
    (weightProduct ? (weightProduct.pricePerKg ?? weightProduct.price) : 0) *
    (parseFloat(weightInput.replace(",", ".")) || 0)
  );

  return (
    <div className="h-screen bg-[#0C1628] flex overflow-hidden">

      {/* ══ LEFT: header + categories + products ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="shrink-0 bg-[#070C18] border-b-2 border-[#1A2F50] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111D35] border border-[#1E3558] text-[#64748B] hover:text-[#F1F5F9] hover:border-[#2D5490] transition-all"
            >
              <ArrowLeft size={18} />
              <span className="font-bold text-sm">Orqaga</span>
            </button>

            <div className="text-center">
              <div className="text-xs text-[#475569] font-semibold uppercase tracking-widest">Stol</div>
              <div className="text-lg font-extrabold text-[#F1F5F9]">{table.name}</div>
            </div>

            {/* mobile cart button */}
            <button
              onClick={() => setShowCart(true)}
              className={cn(
                "md:hidden relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border-2 text-sm transition-all",
                cart.length > 0
                  ? "bg-[#22C55E]/15 border-[#22C55E]/60 text-[#22C55E]"
                  : "bg-[#111D35] border-[#1E3558] text-[#475569]"
              )}
            >
              <ShoppingCart size={17} />
              <span>{cart.length}</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]" />
              )}
            </button>

            <div className="hidden md:block w-24" />
          </div>

          {/* CATEGORIES */}
          <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const colors = CAT_COLOR[cat] ?? CAT_COLOR["asosiy"];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap transition-all font-bold border-2 shrink-0 text-sm",
                    isActive
                      ? cn(colors.active, "shadow-lg scale-[1.04]")
                      : "bg-[#111D35] border-[#1E3558] text-[#475569] hover:border-[#2D5490] hover:text-[#94A3B8]"
                  )}
                >
                  <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                  <span>{CATEGORY_LABELS[cat]}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* PRODUCTS */}
        <div className="flex-1 overflow-y-auto p-5 pb-28 md:pb-5">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-[#334155] font-semibold">
              Bu kategoriyada mahsulot yo'q
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => {
                const inCart = cart.find((i) => i.productId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleAdd(p)}
                    className={cn(
                      "relative text-left p-5 rounded-3xl border-2 transition-all active:scale-[0.95] overflow-hidden group",
                      inCart
                        ? "bg-[#0D2B1A] border-[#22C55E]/70 shadow-xl shadow-[#22C55E]/10"
                        : "bg-[#0D1628] border-[#1A3060] hover:border-[#2D5490] hover:bg-[#111E38]"
                    )}
                  >
                    <div className="text-4xl mb-3 select-none">{CATEGORY_ICONS[p.category]}</div>
                    <div className={cn("font-extrabold text-base leading-snug mb-2", inCart ? "text-[#F0FDF4]" : "text-[#CBD5E1]")}>
                      {p.name}
                    </div>
                    <div className={cn("text-base font-extrabold", inCart ? "text-[#22C55E]" : "text-[#60A5FA]")}>
                      {formatSom(p.isVariableWeight ? (p.pricePerKg ?? p.price) : p.price)}
                      {p.isVariableWeight && <span className="text-xs font-semibold text-[#475569]"> /kg</span>}
                    </div>
                    {inCart && (
                      <div className="absolute top-3 right-3 min-w-[26px] h-[26px] px-1 rounded-full bg-[#22C55E] flex items-center justify-center shadow-lg shadow-[#22C55E]/40">
                        <span className="text-[#0C1628] text-xs font-extrabold">{inCart.quantity}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT: cart panel (full height, tepadan pastgacha) ══ */}
      <div className="hidden md:flex w-[400px] lg:w-[440px] flex-col border-l-2 border-[#1A2F50] bg-[#070C18]">
        {/* panel header — main header bilan bir hizada */}
        <div className="shrink-0 px-5 py-5 border-b-2 border-[#1A2F50] flex items-center gap-3">
          <ShoppingCart size={22} className="text-[#22C55E]" />
          <span className="font-extrabold text-[#F1F5F9] text-lg">Savat</span>
          <span className="text-[#334155]">·</span>
          <span className="text-sm font-bold text-[#64748B]">{table.name}</span>
          {cart.length > 0 && (
            <span className="ml-auto w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center text-[#0C1628] text-sm font-extrabold shadow-md shadow-[#22C55E]/30">
              {cart.length}
            </span>
          )}
        </div>

        {/* panel body */}
        <div className="flex-1 flex flex-col p-4 gap-4 min-h-0 overflow-hidden">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-20 h-20 rounded-3xl bg-[#111D35] border-2 border-[#1A3060] flex items-center justify-center">
                <ShoppingCart size={32} className="text-[#1A3060]" />
              </div>
              <div className="text-[#334155] font-bold">Savat bo'sh</div>
              <div className="text-[#1E3558] text-sm">Chap tarafdan mahsulot tanlang</div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                {CartItems()}
              </div>
              {CartFooter()}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile: floating btn ── */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#0C1628] via-[#0C1628]/90 to-transparent">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#15803D] to-[#22C55E] text-[#0C1628] rounded-2xl font-extrabold shadow-xl shadow-[#22C55E]/25 active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-2"><ShoppingCart size={18} />{cart.length} ta mahsulot</span>
            <span className="text-lg">{formatSom(total)}</span>
          </button>
        </div>
      )}

      {/* ── Mobile: Cart Modal ── */}
      <Modal isOpen={showCart} onClose={() => setShowCart(false)} title={`🛒 ${table.name} — Savat`} size="lg">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#111D35] border-2 border-[#1A3060] flex items-center justify-center mx-auto mb-3">
              <ShoppingCart size={26} className="text-[#1A3060]" />
            </div>
            <div className="text-[#475569] font-bold">Savat bo'sh</div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="max-h-[45vh] overflow-y-auto space-y-2 pr-1">{CartItems()}</div>
            {CartFooter()}
          </div>
        )}
      </Modal>

      {/* ── Weight modal ── */}
      <Modal isOpen={!!weightProduct} onClose={() => setWeightProduct(null)} title={weightProduct?.name} size="sm">
        {weightProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#111D35] border border-[#1E3558] rounded-xl">
              <span className="text-sm text-[#64748B]">Narxi:</span>
              <span className="font-extrabold text-[#60A5FA]">
                {formatSom(weightProduct.pricePerKg ?? weightProduct.price)} / kg
              </span>
            </div>

            <div>
              <label className="text-sm font-bold text-[#94A3B8] mb-2 block">Og'irlik (kg)</label>
              <input
                type="number" step="0.1" min="0.1"
                value={weightInput}
                autoFocus
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#111D35] border-2 border-[#1E3558] rounded-2xl text-[#F1F5F9] text-xl font-extrabold text-center focus:border-[#22C55E] outline-none transition-colors"
              />
            </div>

            {/* live sum */}
            <div className="flex items-center justify-between p-4 bg-[#080D1A] border-2 border-[#22C55E]/40 rounded-2xl">
              <span className="text-sm font-bold text-[#64748B]">Summa:</span>
              <span className="font-extrabold text-2xl text-[#22C55E]">
                {formatSom(weightSum)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWeightProduct(null)}
                className="py-3.5 rounded-2xl border-2 border-[#1E3558] bg-[#111D35] text-[#64748B] font-bold hover:border-[#334155] transition-all flex items-center justify-center gap-2"
              >
                <X size={16} /> Bekor
              </button>
              <button
                onClick={handleAddWeight}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-[#15803D] to-[#22C55E] text-[#0C1628] font-extrabold hover:opacity-90 transition-all shadow-lg shadow-[#22C55E]/20 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Qo'shish
              </button>
            </div>
          </div>
        )}
      </Modal>

      {receiptOrder && (
        <Receipt
          order={receiptOrder}
          onClose={() => { setReceiptOrder(null); onBack(); }}
        />
      )}
    </div>
  );
}
