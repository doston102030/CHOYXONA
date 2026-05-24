"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, OrderItem, Product, Table, Waiter } from "@/types";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_TABLES,
  SERVICE_PERCENT,
} from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";
import {
  productFromDb,
  productToDb,
  tableFromDb,
  tableToDb,
  orderFromDb,
  orderToDb,
  waiterFromDb,
} from "@/lib/mappers";

interface AppState {
  products: Product[];
  tables: Table[];
  waiters: Waiter[];
  orders: Order[];
  activeOrders: Order[];

  currentTableId: string | null;
  cart: OrderItem[];
  isInitialized: boolean;
  isOnline: boolean;

  init: () => Promise<void>;

  addTable: (name: string, type: Table["type"]) => Promise<void>;
  updateTable: (id: string, data: Partial<Table>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;

  addProduct: (p: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addWaiter: (name: string, pin: string) => Promise<void>;
  updateWaiter: (id: string, data: Partial<Waiter>) => Promise<void>;
  deleteWaiter: (id: string) => Promise<void>;
  findWaiterByPin: (pin: string) => Waiter | undefined;

  openTable: (tableId: string) => void;
  closeTableView: () => void;
  addToCart: (product: Product, quantity?: number, weight?: number) => void;
  updateCartItem: (itemId: string, quantity: number, weight?: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  saveOrderForTable: (waiterId?: string, waiterName?: string) => Promise<Order | null>;
  closeOrder: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getActiveOrderForTable: (tableId: string) => Order | null;

  _applyRealtimeUpsert: (table: "products" | "tables" | "orders" | "waiters", row: any) => void;
  _applyRealtimeDelete: (table: "products" | "tables" | "orders" | "waiters", id: string) => void;
}

const calculateTotals = (items: OrderItem[]) => {
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const serviceFee = Math.round((subtotal * SERVICE_PERCENT) / 100);
  const total = subtotal + serviceFee;
  return { subtotal, serviceFee, total };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: DEFAULT_PRODUCTS.map((p) => ({ ...p, createdAt: new Date().toISOString() })),
      tables: DEFAULT_TABLES,
      waiters: [],
      orders: [],
      activeOrders: [],
      currentTableId: null,
      cart: [],
      isInitialized: false,
      isOnline: false,

      init: async () => {
        if (!isSupabaseEnabled) {
          set({ isInitialized: true, isOnline: false });
          return;
        }

        try {
          const [productsRes, tablesRes, waitersRes, activeRes, historyRes] = await Promise.all([
            supabase.from("products").select("*").order("created_at", { ascending: true }),
            supabase.from("tables").select("*").order("order", { ascending: true }),
            supabase.from("waiters").select("*").order("created_at", { ascending: true }),
            supabase.from("orders").select("*").eq("status", "ochiq").order("created_at", { ascending: false }),
            supabase
              .from("orders")
              .select("*")
              .in("status", ["yopildi", "bekor"])
              .order("closed_at", { ascending: false })
              .limit(500),
          ]);

          set({
            products: (productsRes.data ?? []).map(productFromDb),
            tables: (tablesRes.data ?? []).map(tableFromDb),
            waiters: (waitersRes.data ?? []).map(waiterFromDb),
            activeOrders: (activeRes.data ?? []).map(orderFromDb),
            orders: (historyRes.data ?? []).map(orderFromDb),
            isInitialized: true,
            isOnline: true,
          });

          supabase
            .channel("sohil-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (p) => {
              if (p.eventType === "DELETE") get()._applyRealtimeDelete("products", (p.old as any).id);
              else get()._applyRealtimeUpsert("products", p.new);
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "tables" }, (p) => {
              if (p.eventType === "DELETE") get()._applyRealtimeDelete("tables", (p.old as any).id);
              else get()._applyRealtimeUpsert("tables", p.new);
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (p) => {
              if (p.eventType === "DELETE") get()._applyRealtimeDelete("orders", (p.old as any).id);
              else get()._applyRealtimeUpsert("orders", p.new);
            })
            .on("postgres_changes", { event: "*", schema: "public", table: "waiters" }, (p) => {
              if (p.eventType === "DELETE") get()._applyRealtimeDelete("waiters", (p.old as any).id);
              else get()._applyRealtimeUpsert("waiters", p.new);
            })
            .subscribe();
        } catch (err) {
          console.error("[init] Supabase error:", err);
          set({ isInitialized: true, isOnline: false });
        }
      },

      addTable: async (name, type) => {
        const t: Table = {
          id: generateId(), name, type, isActive: true,
          order: get().tables.length + 1,
        };
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("tables").insert(tableToDb(t));
          if (error) throw error;
        } else set((s) => ({ tables: [...s.tables, t] }));
      },

      updateTable: async (id, data) => {
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("tables").update(tableToDb(data)).eq("id", id);
          if (error) throw error;
        } else set((s) => ({ tables: s.tables.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
      },

      deleteTable: async (id) => {
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("tables").delete().eq("id", id);
          if (error) throw error;
        } else set((s) => ({ tables: s.tables.filter((t) => t.id !== id) }));
      },

      addProduct: async (p) => {
        const product: Product = { ...p, id: generateId(), createdAt: new Date().toISOString() };
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("products").insert(productToDb(product));
          if (error) throw error;
        } else set((s) => ({ products: [...s.products, product] }));
      },

      updateProduct: async (id, data) => {
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("products").update(productToDb(data)).eq("id", id);
          if (error) throw error;
        } else set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
      },

      deleteProduct: async (id) => {
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("products").delete().eq("id", id);
          if (error) throw error;
        } else set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      },

      addWaiter: async (name, pin) => {
        const w: Waiter = {
          id: generateId(), name, pin, isActive: true,
          createdAt: new Date().toISOString(),
        };
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("waiters").insert({
            id: w.id, name: w.name, pin: w.pin, is_active: true,
          });
          if (error) throw error;
        } else set((s) => ({ waiters: [...s.waiters, w] }));
      },

      updateWaiter: async (id, data) => {
        if (isSupabaseEnabled) {
          const upd: any = {};
          if (data.name !== undefined) upd.name = data.name;
          if (data.pin !== undefined) upd.pin = data.pin;
          if (data.isActive !== undefined) upd.is_active = data.isActive;
          const { error } = await supabase.from("waiters").update(upd).eq("id", id);
          if (error) throw error;
        } else set((s) => ({ waiters: s.waiters.map((w) => (w.id === id ? { ...w, ...data } : w)) }));
      },

      deleteWaiter: async (id) => {
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("waiters").delete().eq("id", id);
          if (error) throw error;
        } else set((s) => ({ waiters: s.waiters.filter((w) => w.id !== id) }));
      },

      findWaiterByPin: (pin) => get().waiters.find((w) => w.isActive && w.pin === pin),

      openTable: (tableId) => {
        const existing = get().activeOrders.find((o) => o.tableId === tableId);
        set({ currentTableId: tableId, cart: existing ? [...existing.items] : [] });
      },

      closeTableView: () => set({ currentTableId: null, cart: [] }),

      addToCart: (product, quantity = 1, weight) => {
        const isWeight = product.isVariableWeight;
        const qty = isWeight ? 1 : quantity;
        const w = isWeight ? (weight ?? 1) : undefined;
        const pricePer = isWeight ? (product.pricePerKg ?? product.price) : product.price;
        const subtotal = isWeight ? Math.round(pricePer * (w ?? 1)) : pricePer * qty;

        set((state) => {
          if (!isWeight) {
            const existing = state.cart.find((i) => i.productId === product.id);
            if (existing) {
              return {
                cart: state.cart.map((i) =>
                  i.id === existing.id
                    ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.price }
                    : i
                ),
              };
            }
          }
          return {
            cart: [
              ...state.cart,
              {
                id: generateId(),
                productId: product.id,
                productName: product.name,
                price: pricePer,
                quantity: qty,
                weight: w,
                subtotal,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      updateCartItem: (itemId, quantity, weight) =>
        set((state) => ({
          cart: state.cart.map((i) => {
            if (i.id !== itemId) return i;
            const w = weight ?? i.weight;
            if (i.weight !== undefined) {
              return { ...i, weight: w, subtotal: Math.round(i.price * (w ?? 1)) };
            }
            return { ...i, quantity, subtotal: quantity * i.price };
          }),
        })),

      removeFromCart: (itemId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== itemId) })),

      clearCart: () => set({ cart: [] }),

      saveOrderForTable: async (waiterId, waiterName) => {
        const { currentTableId, cart, tables, activeOrders } = get();
        if (!currentTableId || cart.length === 0) return null;
        const table = tables.find((t) => t.id === currentTableId);
        if (!table) return null;

        const { subtotal, serviceFee, total } = calculateTotals(cart);
        const existing = activeOrders.find((o) => o.tableId === currentTableId);

        const order: Order = {
          id: existing?.id ?? generateId(),
          tableId: currentTableId,
          tableName: table.name,
          items: [...cart],
          subtotal, servicePercent: SERVICE_PERCENT, serviceFee, total,
          status: "ochiq",
          waiterId: waiterId ?? existing?.waiterId,
          waiterName: waiterName ?? existing?.waiterName,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
        };

        if (isSupabaseEnabled) {
          const { error } = await supabase.from("orders").upsert(orderToDb(order));
          if (error) throw error;
        } else {
          set((state) => ({
            activeOrders: existing
              ? state.activeOrders.map((o) => (o.id === existing.id ? order : o))
              : [...state.activeOrders, order],
          }));
        }
        return order;
      },

      closeOrder: async (orderId) => {
        const order = get().activeOrders.find((o) => o.id === orderId);
        if (!order) return null;
        const closed: Order = { ...order, status: "yopildi", closedAt: new Date().toISOString() };

        if (isSupabaseEnabled) {
          const { error } = await supabase
            .from("orders")
            .update({ status: "yopildi", closed_at: closed.closedAt })
            .eq("id", orderId);
          if (error) throw error;
        } else {
          set((state) => ({
            activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
            orders: [closed, ...state.orders],
            cart: state.currentTableId === order.tableId ? [] : state.cart,
          }));
        }
        return closed;
      },

      cancelOrder: async (orderId) => {
        if (isSupabaseEnabled) {
          const { error } = await supabase
            .from("orders")
            .update({ status: "bekor", closed_at: new Date().toISOString() })
            .eq("id", orderId);
          if (error) throw error;
        } else {
          set((state) => ({ activeOrders: state.activeOrders.filter((o) => o.id !== orderId) }));
        }
      },

      deleteOrder: async (orderId) => {
        if (isSupabaseEnabled) {
          const { error } = await supabase.from("orders").delete().eq("id", orderId);
          if (error) throw error;
        } else {
          set((s) => ({
            orders: s.orders.filter((o) => o.id !== orderId),
            activeOrders: s.activeOrders.filter((o) => o.id !== orderId),
          }));
        }
      },

      getActiveOrderForTable: (tableId) =>
        get().activeOrders.find((o) => o.tableId === tableId) ?? null,

      _applyRealtimeUpsert: (table, row) => {
        if (table === "products") {
          const p = productFromDb(row);
          set((s) => ({
            products: s.products.find((x) => x.id === p.id)
              ? s.products.map((x) => (x.id === p.id ? p : x))
              : [...s.products, p],
          }));
        } else if (table === "tables") {
          const t = tableFromDb(row);
          set((s) => ({
            tables: s.tables.find((x) => x.id === t.id)
              ? s.tables.map((x) => (x.id === t.id ? t : x))
              : [...s.tables, t],
          }));
        } else if (table === "waiters") {
          const w = waiterFromDb(row);
          set((s) => ({
            waiters: s.waiters.find((x) => x.id === w.id)
              ? s.waiters.map((x) => (x.id === w.id ? w : x))
              : [...s.waiters, w],
          }));
        } else if (table === "orders") {
          const o = orderFromDb(row);
          if (o.status === "ochiq") {
            set((s) => ({
              activeOrders: s.activeOrders.find((x) => x.id === o.id)
                ? s.activeOrders.map((x) => (x.id === o.id ? o : x))
                : [...s.activeOrders, o],
              orders: s.orders.filter((x) => x.id !== o.id),
            }));
          } else {
            set((s) => ({
              activeOrders: s.activeOrders.filter((x) => x.id !== o.id),
              orders: s.orders.find((x) => x.id === o.id)
                ? s.orders.map((x) => (x.id === o.id ? o : x))
                : [o, ...s.orders],
            }));
          }
        }
      },

      _applyRealtimeDelete: (table, id) => {
        if (table === "products") set((s) => ({ products: s.products.filter((x) => x.id !== id) }));
        else if (table === "tables") set((s) => ({ tables: s.tables.filter((x) => x.id !== id) }));
        else if (table === "waiters") set((s) => ({ waiters: s.waiters.filter((x) => x.id !== id) }));
        else if (table === "orders") {
          set((s) => ({
            activeOrders: s.activeOrders.filter((x) => x.id !== id),
            orders: s.orders.filter((x) => x.id !== id),
          }));
        }
      },
    }),
    {
      name: "sohil-choyxona-v2",
      partialize: (state) => ({
        products: state.products,
        tables: state.tables,
        waiters: state.waiters,
        orders: state.orders,
        activeOrders: state.activeOrders,
        cart: state.cart,
        currentTableId: state.currentTableId,
      }),
    }
  )
);
