-- ============================================================
-- SOHIL CHOYXONA — Supabase Database Schema
-- ============================================================
-- Bu faylni Supabase Dashboard → SQL Editor ga nusxalab Run bosing
-- ============================================================

-- Mahsulotlar
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  unit TEXT,
  is_variable_weight BOOLEAN DEFAULT FALSE,
  price_per_kg INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stollar
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ofitsiantlar
CREATE TABLE IF NOT EXISTS waiters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,             -- 4 raqamli PIN
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zakazlar
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  service_percent NUMERIC NOT NULL DEFAULT 1,
  service_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ochiq',
  waiter_id TEXT,
  waiter_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexlar
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_closed_at ON orders(closed_at);

-- updated_at avtomatik yangilash
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Hozircha barcha ma'lumotlar ochiq (anon key bilan o'qish/yozish).
-- Bu choyxona ichki ishlatish uchun mos.
-- Keyin auth qo'shilsa, qattiqlashtirish mumkin.

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Hammaga ruxsat (anon key bilan)
CREATE POLICY "open_all_products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all_tables" ON tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all_waiters" ON waiters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME — bu eng muhim qism
-- Bir qurilmada o'zgartirilsa, boshqasida ham ko'rinadi
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE waiters;
