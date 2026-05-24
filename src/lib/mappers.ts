import { Order, OrderItem, Product, Table, Waiter } from "@/types";

// ─── PRODUCTS ───
export const productFromDb = (row: any): Product => ({
  id: row.id,
  name: row.name,
  price: row.price,
  category: row.category,
  unit: row.unit ?? undefined,
  isVariableWeight: row.is_variable_weight ?? false,
  pricePerKg: row.price_per_kg ?? undefined,
  isActive: row.is_active ?? true,
  createdAt: row.created_at ?? new Date().toISOString(),
});

export const productToDb = (p: Partial<Product>) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  category: p.category,
  unit: p.unit,
  is_variable_weight: p.isVariableWeight ?? false,
  price_per_kg: p.pricePerKg ?? null,
  is_active: p.isActive ?? true,
});

// ─── TABLES ───
export const tableFromDb = (row: any): Table => ({
  id: row.id,
  name: row.name,
  type: row.type,
  isActive: row.is_active ?? true,
  order: row.order ?? 0,
});

export const tableToDb = (t: Partial<Table>) => ({
  id: t.id,
  name: t.name,
  type: t.type,
  is_active: t.isActive ?? true,
  order: t.order ?? 0,
});

// ─── ORDERS ───
export const orderFromDb = (row: any): Order => ({
  id: row.id,
  tableId: row.table_id,
  tableName: row.table_name,
  items: (row.items as OrderItem[]) ?? [],
  subtotal: row.subtotal,
  servicePercent: row.service_percent,
  serviceFee: row.service_fee,
  total: row.total,
  status: row.status,
  waiterId: row.waiter_id ?? undefined,
  waiterName: row.waiter_name ?? undefined,
  createdAt: row.created_at,
  closedAt: row.closed_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
});

export const orderToDb = (o: Partial<Order>) => ({
  id: o.id,
  table_id: o.tableId,
  table_name: o.tableName,
  items: o.items ?? [],
  subtotal: o.subtotal ?? 0,
  service_percent: o.servicePercent ?? 1,
  service_fee: o.serviceFee ?? 0,
  total: o.total ?? 0,
  status: o.status ?? "ochiq",
  waiter_id: o.waiterId ?? null,
  waiter_name: o.waiterName ?? null,
  created_at: o.createdAt,
  closed_at: o.closedAt ?? null,
});

// ─── WAITERS ───
export const waiterFromDb = (row: any): Waiter => ({
  id: row.id,
  name: row.name,
  pin: row.pin,
  isActive: row.is_active ?? true,
  createdAt: row.created_at ?? new Date().toISOString(),
});

export const waiterToDb = (w: Partial<Waiter>) => ({
  id: w.id,
  name: w.name,
  pin: w.pin,
  is_active: w.isActive ?? true,
});
