import { Product, Table } from "@/types";

// localStorage fallback uchun (Supabase yo'q bo'lsa)
export const DEFAULT_PRODUCTS: Product[] = [
  { id: "p1", name: "Non", price: 4000, category: "asosiy", unit: "dona", isActive: true, createdAt: "" },
  { id: "p2", name: "Choy", price: 3000, category: "asosiy", unit: "dona", isActive: true, createdAt: "" },
  { id: "p3", name: "Salfetka", price: 5000, category: "asosiy", unit: "dona", isActive: true, createdAt: "" },
  { id: "p4", name: "Nam salfetka", price: 4000, category: "asosiy", unit: "dona", isActive: true, createdAt: "" },
  { id: "p5", name: "Kichik salat", price: 10000, category: "salat", unit: "dona", isActive: true, createdAt: "" },
  { id: "p6", name: "Katta salat", price: 20000, category: "salat", unit: "dona", isActive: true, createdAt: "" },
  { id: "p7", name: "Kalampir", price: 2000, category: "qoshimcha", unit: "dona", isActive: true, createdAt: "" },
  { id: "p8", name: "Pepsi 1L", price: 15000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p9", name: "Pepsi 1.5L", price: 18000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p10", name: "Coca-Cola 1.5L", price: 18000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p11", name: "Coca-Cola 2L", price: 20000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p12", name: "Fanta 1.5L", price: 18000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p13", name: "Sok (Viko)", price: 22000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p14", name: "Silver suv", price: 5000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p15", name: "Garden sharbat", price: 20000, category: "ichimlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p16", name: "Qiyma shashlik", price: 20000, category: "shashlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p17", name: "Go'sht shashlik", price: 24000, category: "shashlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p18", name: "Qo'y go'shti shashlik", price: 30000, category: "shashlik", unit: "dona", isActive: true, createdAt: "" },
  { id: "p19", name: "Kanotcha", price: 75000, pricePerKg: 75000, category: "maxsus", unit: "kg", isVariableWeight: true, isActive: true, createdAt: "" },
  { id: "p20", name: "O'rdak go'shti", price: 140000, pricePerKg: 140000, category: "maxsus", unit: "kg", isVariableWeight: true, isActive: true, createdAt: "" },
];

export const DEFAULT_TABLES: Table[] = [
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `t-xona-${i + 1}`,
    name: `Xona ${i + 1}`,
    type: "oddiy" as const,
    isActive: true,
    order: i + 1,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `t-sori-${i + 1}`,
    name: `So'ri ${i + 1}`,
    type: "sori" as const,
    isActive: true,
    order: 100 + i + 1,
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `t-ustol-${i + 1}`,
    name: `Ustol ${i + 1}`,
    type: "ustol" as const,
    isActive: true,
    order: 200 + i + 1,
  })),
  { id: "t-katta-1", name: "Katta xona 1", type: "katta", isActive: true, order: 301 },
  { id: "t-katta-3", name: "Katta xona 3", type: "katta", isActive: true, order: 303 },
  { id: "t-katta-4", name: "Katta xona 4", type: "katta", isActive: true, order: 304 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  asosiy: "Asosiy",
  salat: "Salatlar",
  qoshimcha: "Qo'shimchalar",
  ichimlik: "Ichimliklar",
  shashlik: "Shashliklar",
  maxsus: "Maxsus taomlar",
};

export const CATEGORY_ICONS: Record<string, string> = {
  asosiy: "🍞",
  salat: "🥗",
  qoshimcha: "🌶",
  ichimlik: "🥤",
  shashlik: "🍢",
  maxsus: "🍗",
};

export const SERVICE_PERCENT = 1;

// Admin login — env'dan keladi, fallback bilan
export const ADMIN_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || "Bobir2020",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "3700",
};
