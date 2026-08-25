# PRD v2 — yourstory.kp (Rental ERP, ala SewaScale versi disederhanakan)

## 1. Latar & Tujuan
Sistem rental end-to-end untuk UMKM: customer booking online → admin kelola → barang dipinjam & dikembalikan → ada buffer maintenance → konsinyasi (titip sewa) dengan bagi hasil. Admin bisa kustomisasi penuh.

## 2. Peran (Roles)
- **Customer** — publik, tanpa login. Browse katalog, cart, booking, isi kontak & DP.
- **Admin** — kelola semua: item, kategori, booking, customer, consignor, keuangan, settings.
- **Consignor** — login sendiri, lihat barang titipan, booking barangnya, & nominal bagi hasil.

## 3. Alur Utama
**Customer:** buka web → katalog → pilih produk + cart → checkout (pilih tgl mulai, mis. +3 hari) → bayar DP (manual/transfer) → booking diverifikasi admin → di tgl sewa datang ke toko, serah KTP & bayar sisa → bawa barang → kembalikan sesuai jadwal.
**Admin:** lihat order booking (jelas item + tgl + status bayar) → siapkan barang → otomatis stok -1 saat tgl peminjaman → produk "ready" bila tak dipinjam → ada spare `maintenance_days` tiap produk (cuci/cek rusak) sebelum ready lagi → terima sisa + KTP → sistem catat masa sewa + hari maintenance → produk ready.
**Consignor:** login → dashboard barang titipan + riwayat sewa + total bagi hasil (perhitungan ditampilkan; pencatatan & TF dilakukan manual di app lain milik user).

## 4. Fitur & Halaman
**Customer (publik):**
- `/` katalog (filter kategori, cari, lihat stok/ready)
- `/cart` & `/booking` checkout (pilih tanggal, durasi, kontak, DP, konfirmasi)
- `/booking/[id]` status booking

**Admin (`/admin`):**
- Dashboard KPI (booking aktif, telat, revenue, piutang, sisa)
- Items CRUD (+ owner_type: store/consignor, consignor, profit_share_pct, maintenance_days, stok)
- Categories CRUD
- Bookings: list + detail → konfirmasi DP, tandai ambil barang (KTP diterima), tandai kembali, catat pembayaran sisa/denda, upload dokumen
- Customers (CRM dasar + blacklist)
- Consignors CRUD + relasi item
- Settings (nama toko, mata uang, default DP %, aturan denda)

**Consignor (`/consignor`):**
- Login + dashboard: item titipan, booking terkait, total bagi hasil

## 5. Data Model (Drizzle/Postgres)
- `users` (admin): id, email, password_hash
- `consignors`: id, nama, email, password_hash, kontak, catatan
- `categories`: id, nama, deskripsi
- `items`: id, category_id, nama, sku, deskripsi, harga_sewa, satuan_sewa(='hari'), stok_total, **maintenance_days**, owner_type('store'|'consignor'), consignor_id?, profit_share_pct?, foto_url, catatan
- `customers`: id, nama, kontak, email, catatan, blacklist
- `bookings`: id, customer_id, start_date, end_date, total, dp_amount, dp_paid, remaining, deposit_type, deposit_received, deposit_returned, status('booking'|'active'|'late'|'returned'|'completed'|'cancelled'), notes
- `booking_items`: id, booking_id, item_id, qty, price, subtotal, maintenance_days
- `payments`: id, booking_id, type('dp'|'remaining'|'denda'), amount, method, paid_at, note
- `documents`: id, booking_id, type('ktp'|'selfie'|'other'), url
- `settings`: store_name='yourstory.kp', currency='IDR', default_dp_pct, late_fee_rule

## 6. Logika Penting
- **Ketersediaan:** item unavailable pada window `[start_date … end_date + maintenance_days]` dari tiap booking. Stok tersedia = `stok_total − Σ qty booked` di tanggal tsb.
- **Stok -1 otomatis** saat tanggal peminjaman (derived dari booking, bukan manual).
- **Bagi hasil:** untuk item consignor, `profit_share = total × profit_share_pct`; tampil di dashboard consignor & admin. TF manual di app lain.
- **Status flow:** booking → active (saat diambil) → returned → completed; otomatis `late` bila lewat end_date.

## 7. Tech Stack
Next.js (App Router, TS) · Drizzle ORM · Neon Postgres (HTTP driver) · Tailwind CSS + shadcn/ui · Auth.js (credentials, role admin & consignor) · Serwist PWA · Vercel (alt Netlify) · Folder `Documents\yourstory`.

## 8. Phases
- **P0** Setup project, Neon, Drizzle, Tailwind, shadcn, Auth.js
- **P1** Schema + Admin auth + Items/Categories CRUD (dengan owner_type, maintenance_days, consignor) + Settings
- **P2** Katalog customer + Cart + Booking (DP manual)
- **P3** Admin booking mgmt + availability logic + status flow + dokumen KTP + payments
- **P4** Consignor login + dashboard + bagi hasil
- **P5** Dashboard KPI admin + Customers/blacklist
- **P6** PWA
- **P7** Deploy Vercel + `drizzle-kit push`

## 9. Asumsi
- Satuan sewa default = **hari**; mata uang **IDR**; default DP 30% (di-set admin).
- Pembayaran DP **manual** (customer transfer, admin konfirmasi).
- Consignor punya **login & dashboard sendiri**; TF bagi hasil manual di app lain.
- Belum ada payment gateway & notifikasi WA/Telegram di MVP (future).
- UI: nuansa outdoor, palet cream + forest green / terracotta / wood.

## 10. Success Metrics
- Customer bisa booking end-to-end (katalog→cart→DP→status).
- Admin kelola booking & stok otomatis -1 saat peminjaman + buffer maintenance.
- Consignor lihat barang & bagi hasil.
- Deploy online + PWA install di HP.
