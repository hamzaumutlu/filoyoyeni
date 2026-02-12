# Filoyo CRM - Proje Durumu

> **Son Güncelleme:** 2026-01-30  
> **Production URL:** https://filoyonet.vercel.app

---

## 🎯 Proje Hakkında

Filoyo, Rent-a-Car şirketleri için B2B CRM ve Finansal Takip Sistemi.

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS v4 + Custom CSS Variables
- Database: Supabase (PostgreSQL)
- Deployment: Vercel

---

## ✅ Supabase Entegrasyonu

Tüm ana sayfalar Supabase veritabanına bağlı:

| Sayfa | Hook | Dosya |
|-------|------|-------|
| Firmalar | `useCompaniesSupabase` | `src/pages/Companies.tsx` |
| Yöntemler | `useMethodsSupabase` | `src/pages/Methods.tsx` |
| Personel | `usePersonnelSupabase`, `useAdvancesSupabase` | `src/pages/Personnel.tsx` |
| Ödemeler | `usePaymentsSupabase` | `src/pages/Payments.tsx` |
| Veri Girişi | `useDataEntriesSupabase` | `src/pages/DataEntry.tsx` |

**Tüm hook'lar:** `src/hooks/useSupabase.ts`

---

## 🎨 Tema

- **Arkaplan:** Mor/İndigo tonları (`#1E1B4B`, `#2E2A5E`, `#3B3670`)
- **Accent:** Turuncu (`#FF5722`)
- **Dark mode + Glassmorphism**

Renkler: `src/index.css` içinde CSS variables olarak tanımlı.

---

## 📁 Önemli Dosyalar

```
src/
├── hooks/useSupabase.ts     # ⭐ Tüm Supabase hook'ları
├── lib/supabase.ts          # Supabase client
├── index.css                # Tema renkleri
├── pages/                   # Sayfa bileşenleri
└── components/              # UI bileşenleri
```

---

## 🚀 Komutlar

```bash
# Development
npm run dev

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

---

## ⚠️ Bilinen Sorunlar

1. Dashboard henüz Supabase'e bağlı değil
2. RLS policy'leri Supabase'de kontrol edilmeli
3. `data_entries` tablosu veritabanında olmayabilir

---

## 📝 Veri Dönüşümü

Supabase snake_case kullanıyor, frontend camelCase. Her hook içinde dönüşüm fonksiyonları var:
- `mapXFromDb()` - DB → Frontend
- `mapXToDb()` - Frontend → DB
