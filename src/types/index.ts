export type ProductCategory =
  | "asosiy"
  | "salat"
  | "qoshimcha"
  | "ichimlik"
  | "shashlik"
  | "maxsus";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  unit?: "dona" | "kg" | "litr";
  isVariableWeight?: boolean;
  pricePerKg?: number;
  isActive: boolean;
  createdAt: string;
}

export type TableType = "oddiy" | "sori" | "ustol" | "katta";

export interface Table {
  id: string;
  name: string;
  type: TableType;
  isActive: boolean;
  order: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  weight?: number;
  subtotal: number;
  // Ofitsiant qachon qo'shgan
  addedAt?: string;
}

export type OrderStatus = "ochiq" | "yopildi" | "bekor";

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  subtotal: number;
  servicePercent: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  waiterId?: string;
  waiterName?: string;
  createdAt: string;
  closedAt?: string;
  updatedAt?: string;
}

export interface Waiter {
  id: string;
  name: string;
  pin: string;          // 4 raqamli PIN
  isActive: boolean;
  createdAt: string;
}

export interface AdminUser {
  username: string;
  password: string;
}
