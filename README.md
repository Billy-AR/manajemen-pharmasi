# Apotek Cloud – Next.js 15 + Firebase (Auth/Firestore) – Local first

Fokus lokal dulu, single role: admin.

## Setup lokal
1) Duplikasi `.env.example` ke `.env.local` dan isi Firebase Web config + service account JSON.
2) Isi SMTP (host/port/user/pass) + `ALERT_EMAIL_TO` untuk email reminder admin.
3) Install dependency (dari Windows host):
   ```bash
   npm install
   ```
4) Jalankan dev server:
   ```bash
   npm run dev
   ```
   Buka http://localhost:3000.

## Fitur awal (skeleton)
- Login admin (Firebase email/password) → set session cookie.
- Middleware proteksi `/dashboard`, `/obat`, `/kasir`, `/laporan`, `/supplier`, `/users`.
- Layout admin + tombol logout.
- Halaman placeholder untuk fitur CRUD obat, stok, kasir, laporan, supplier, manajemen user.

## Notifikasi/Reminder
- Logika email di `lib/alerts.ts` (cek stok rendah, kadaluarsa).
- Endpoint manual: `POST /api/alerts/run` (terproteksi admin) → kirim email via SMTP dan catat ke koleksi `alerts`.
- Threshold env: `ALERT_MIN_STOCK`, `ALERT_DAYS_BEFORE_EXPIRE`.

## TODO berikutnya
- Sambungkan Firestore nyata untuk CRUD obat, supplier, sales, stockMovements.
- Role guard lebih detail (saat ini admin saja).
- Tambah UI tabel/form + grafik dashboard.
- Tambah cron (Vercel Cron atau Cloud Scheduler) hit `/api/alerts/run` setelah siap deploy.
