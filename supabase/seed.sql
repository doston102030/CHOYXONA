-- ============================================================
-- BOSHLANG'ICH MA'LUMOTLAR
-- Schema'ni Run qilgandan keyin BU FAYLNI HAM Run qiling
-- ============================================================

-- ───────────── STOLLAR ─────────────

-- Oddiy xonalar 1-7
INSERT INTO tables (id, name, type, "order", is_active) VALUES
  ('t-xona-1', 'Xona 1', 'oddiy', 1, true),
  ('t-xona-2', 'Xona 2', 'oddiy', 2, true),
  ('t-xona-3', 'Xona 3', 'oddiy', 3, true),
  ('t-xona-4', 'Xona 4', 'oddiy', 4, true),
  ('t-xona-5', 'Xona 5', 'oddiy', 5, true),
  ('t-xona-6', 'Xona 6', 'oddiy', 6, true),
  ('t-xona-7', 'Xona 7', 'oddiy', 7, true)
ON CONFLICT (id) DO NOTHING;

-- So'rilar 1-11
INSERT INTO tables (id, name, type, "order", is_active) VALUES
  ('t-sori-1',  'So''ri 1',  'sori', 101, true),
  ('t-sori-2',  'So''ri 2',  'sori', 102, true),
  ('t-sori-3',  'So''ri 3',  'sori', 103, true),
  ('t-sori-4',  'So''ri 4',  'sori', 104, true),
  ('t-sori-5',  'So''ri 5',  'sori', 105, true),
  ('t-sori-6',  'So''ri 6',  'sori', 106, true),
  ('t-sori-7',  'So''ri 7',  'sori', 107, true),
  ('t-sori-8',  'So''ri 8',  'sori', 108, true),
  ('t-sori-9',  'So''ri 9',  'sori', 109, true),
  ('t-sori-10', 'So''ri 10', 'sori', 110, true),
  ('t-sori-11', 'So''ri 11', 'sori', 111, true)
ON CONFLICT (id) DO NOTHING;

-- Ustollar 1-5
INSERT INTO tables (id, name, type, "order", is_active) VALUES
  ('t-ustol-1', 'Ustol 1', 'ustol', 201, true),
  ('t-ustol-2', 'Ustol 2', 'ustol', 202, true),
  ('t-ustol-3', 'Ustol 3', 'ustol', 203, true),
  ('t-ustol-4', 'Ustol 4', 'ustol', 204, true),
  ('t-ustol-5', 'Ustol 5', 'ustol', 205, true)
ON CONFLICT (id) DO NOTHING;

-- Katta xonalar tepada: 1, 3, 4
INSERT INTO tables (id, name, type, "order", is_active) VALUES
  ('t-katta-1', 'Katta xona 1', 'katta', 301, true),
  ('t-katta-3', 'Katta xona 3', 'katta', 303, true),
  ('t-katta-4', 'Katta xona 4', 'katta', 304, true)
ON CONFLICT (id) DO NOTHING;

-- ───────────── MAHSULOTLAR ─────────────

-- Asosiy
INSERT INTO products (id, name, price, category, unit, is_active) VALUES
  ('p1', 'Non', 4000, 'asosiy', 'dona', true),
  ('p2', 'Choy', 3000, 'asosiy', 'dona', true),
  ('p3', 'Salfetka', 5000, 'asosiy', 'dona', true),
  ('p4', 'Nam salfetka', 4000, 'asosiy', 'dona', true)
ON CONFLICT (id) DO NOTHING;

-- Salatlar
INSERT INTO products (id, name, price, category, unit, is_active) VALUES
  ('p5', 'Kichik salat', 10000, 'salat', 'dona', true),
  ('p6', 'Katta salat', 20000, 'salat', 'dona', true)
ON CONFLICT (id) DO NOTHING;

-- Qo'shimchalar
INSERT INTO products (id, name, price, category, unit, is_active) VALUES
  ('p7', 'Kalampir', 2000, 'qoshimcha', 'dona', true)
ON CONFLICT (id) DO NOTHING;

-- Ichimliklar
INSERT INTO products (id, name, price, category, unit, is_active) VALUES
  ('p8',  'Pepsi 1L',       15000, 'ichimlik', 'dona', true),
  ('p9',  'Pepsi 1.5L',     18000, 'ichimlik', 'dona', true),
  ('p10', 'Coca-Cola 1.5L', 18000, 'ichimlik', 'dona', true),
  ('p11', 'Coca-Cola 2L',   20000, 'ichimlik', 'dona', true),
  ('p12', 'Fanta 1.5L',     18000, 'ichimlik', 'dona', true),
  ('p13', 'Sok (Viko)',     22000, 'ichimlik', 'dona', true),
  ('p14', 'Silver suv',      5000, 'ichimlik', 'dona', true),
  ('p15', 'Garden sharbat', 20000, 'ichimlik', 'dona', true)
ON CONFLICT (id) DO NOTHING;

-- Shashliklar
INSERT INTO products (id, name, price, category, unit, is_active) VALUES
  ('p16', 'Qiyma shashlik',       20000, 'shashlik', 'dona', true),
  ('p17', 'Go''sht shashlik',     24000, 'shashlik', 'dona', true),
  ('p18', 'Qo''y go''shti shashlik', 30000, 'shashlik', 'dona', true)
ON CONFLICT (id) DO NOTHING;

-- Maxsus taomlar (kg bo'yicha)
INSERT INTO products (id, name, price, price_per_kg, category, unit, is_variable_weight, is_active) VALUES
  ('p19', 'Kanotcha',      75000,  75000, 'maxsus', 'kg', true, true),
  ('p20', 'O''rdak go''shti', 140000, 140000, 'maxsus', 'kg', true, true)
ON CONFLICT (id) DO NOTHING;

-- ───────────── OFITSIANTLAR (boshlang'ich) ─────────────
-- PIN = 4 raqam, ofitsiant kiritadi
INSERT INTO waiters (id, name, pin, is_active) VALUES
  ('w-1', 'Ofitsiant 1', '1111', true),
  ('w-2', 'Ofitsiant 2', '2222', true)
ON CONFLICT (id) DO NOTHING;
