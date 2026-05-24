# 🏝 Sohil Choyxona — POS tizimi

Choyxona uchun real-time zakaz qabul qilish, chek chiqarish va hisob-kitob tizimi.

---

## ✨ Imkoniyatlar

### 👤 Ofitsiant ekrani
- 4 raqamli PIN bilan kirish (har ofitsiant alohida)
- Stollarni ko'rish (oddiy / so'ri / ustol / katta xona)
- Menyu bo'yicha zakaz qabul qilish
- 1% xizmat haqi avtomatik qo'shiladi
- Kg bo'yicha taomlar (kanotcha 1.2 kg, o'rdak 0.5 kg va h.k.)
- Saqlash (ochiq qoldirish — bir nechta marta qo'shish mumkin)
- Chek chiqarish 58/80mm termal printerga
- Bekor qilish

### 🛠 Admin panel
- Login: `Bobir2020` / `3700` (env'dan o'zgartirsa bo'ladi)
- **Dashboard**: kunlik / oylik / yillik hisobot, grafik, top mahsulotlar, stol bo'yicha tushum
- **Shashlik bo'yicha alohida hisobot**: qaysi stolga qancha qaysi shashlikdan sotilgan
- **Zakazlar tarixi**: ko'rish, qidirish, o'chirish
- **Mahsulotlar**: qo'shish/o'chirish/narx o'zgartirish
- **Stollar**: qo'shish/o'chirish/turini o'zgartirish
- **Ofitsiantlar**: qo'shish/o'chirish/PIN o'zgartirish

### 🔄 Real-time sinxron
- Bitta planshetda zakaz qo'shilsa, admin telefonida darhol ko'rinadi
- Supabase orqali bir nechta qurilma birlashadi
- Internet bo'lmasa, localStorage'da ishlaydi (oflayn rejim)

---

## 🚀 Ishga tushirish

### 1-qadam: Supabase loyhasini yarating

1. [https://supabase.com](https://supabase.com) ga kiring (bepul)
2. **New project** bosing → nom va parol kiriting → **Create**
3. Loyha tayyor bo'lguncha kuting (~2 daqiqa)

### 2-qadam: Database schema'ni Supabase'ga qo'shing

1. Supabase Dashboard'da chap menyudagi **SQL Editor** ga kiring
2. `supabase/schema.sql` faylini oching, ichidagi kodni nusxalang
3. SQL Editor'ga joylashtiring → **Run** bosing
4. Endi `supabase/seed.sql` faylini ham xuddi shunday qiling (stollar va mahsulotlar)

### 3-qadam: Loyhani sozlang

```bash
# Kutubxonalarni o'rnatish
npm install

# .env.local fayli yarating
cp .env.example .env.local
```

`.env.local` ichida:
1. Supabase Dashboard → **Settings → API** ga kiring
2. **Project URL** va **anon public key** ni nusxalang
3. `.env.local` ga joylashtiring:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4-qadam: Ishga tushiring

```bash
npm run dev
```

Brauzerda oching: **http://localhost:3000**

---

## 🔑 Birinchi marta kirish

1. **Admin panelga kiring**: `http://localhost:3000/admin/login`
   - Login: `Bobir2020`
   - Parol: `3700`
2. **Ofitsiantlar** bo'limidan ofitsiant qo'shing (yoki seed.sql orqali Ofitsiant 1 — PIN 1111 va Ofitsiant 2 — PIN 2222 avtomatik qo'shiladi)
3. Bosh sahifaga qayting → ofitsiant PIN bilan kiring → zakaz qabul qiling

---

## 🌐 Bir nechta qurilmada ishlatish

Supabase ulangandan keyin loyha **avtomatik sinxron** ishlaydi:

1. **Planshet (ofitsiant)** — choyxonada qoladi, zakaz qabul qilinadi
2. **Sizning telefoningiz (admin)** — istalgan joydan ochib hisobotlarni ko'rasiz
3. **Boshqa kompyuter** — yana bir admin/ofitsiant ishlatishi mumkin

Birida o'zgartirilgan narsa **2-3 soniyada** boshqa qurilmalarda ko'rinadi.

---

## 🖨 Chek printer

1. 58mm yoki 80mm termal printer drayverini OS'ga o'rnating
2. Brauzerda standart printer qilib tanlang
3. Yopib chek chiqarganingizda → "Chop etish" → avtomatik shu printerga yuboradi

---

## 🎨 Texnologiyalar

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — dizayn
- **Supabase** — database + real-time sinxron
- **Zustand** — state management
- **Recharts** — grafiklar
- **react-to-print** — chek chop etish

---

## ❓ Muammolar bo'lsa

- **"Mahalliy" ko'rsatib turibdi** — Supabase sozlanmagan. `.env.local` ni tekshiring.
- **Real-time ishlamayapti** — `schema.sql` faylida `ALTER PUBLICATION supabase_realtime ADD TABLE ...` qatorlari ishlaganini tekshiring.
- **Admin parolini unutdim** — `.env.local` da `NEXT_PUBLIC_ADMIN_PASSWORD` ni o'zgartiring.
- **Ofitsiant PIN'ni unutdim** — admin panelga kirib `/admin/waiters` da PIN'ni ko'rishingiz mumkin.
