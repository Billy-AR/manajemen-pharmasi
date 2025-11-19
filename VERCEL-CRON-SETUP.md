# 🕐 Panduan Setup Vercel Cron Jobs untuk Alert Otomatis

## 📋 Overview

Sistem ini menggunakan **Vercel Cron Jobs** untuk mengirim notifikasi email secara otomatis setiap hari pada pukul **08:00 WIB** untuk:

- Obat dengan stok menipis (≤ threshold minimal)
- Obat yang akan kadaluarsa (dalam 14 hari)

---

## 🚀 Cara Setup

### 1️⃣ Generate CRON_SECRET

Buat secret key untuk keamanan cron job:

**Windows (PowerShell):**

```powershell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Linux/Mac:**

```bash
openssl rand -base64 32
```

Copy hasilnya, contoh: `kR8mN2pQ7vL3xY9zA1bC4dE5fG6hJ8iK0lM`

### 2️⃣ Setting Environment Variables di Vercel

Masuk ke **Vercel Dashboard** → Pilih project → **Settings** → **Environment Variables**

Tambahkan variable baru:

```
Name: CRON_SECRET
Value: (paste hasil generate di atas)
Environment: Production, Preview, Development (pilih semua)
```

Pastikan juga semua variable lain sudah terisi:

- ✅ SMTP_HOST, SMTP_USER, SMTP_PASS
- ✅ ALERT_EMAIL_TO
- ✅ FIREBASE credentials
- ✅ URL_WEBSITE

### 3️⃣ Deploy ke Vercel

```bash
# Push ke repository
git add .
git commit -m "Add Vercel Cron Jobs for auto alerts"
git push origin main
```

Atau deploy manual:

```bash
vercel --prod
```

### 4️⃣ Verifikasi Cron Job Aktif

1. Buka **Vercel Dashboard** → Project → **Cron Jobs**
2. Pastikan muncul:
   - **Path:** `/api/cron/alerts`
   - **Schedule:** `0 8 * * *` (Setiap hari jam 8 pagi UTC)
   - **Status:** Active ✅

---

## ⏰ Jadwal Cron

| Schedule      | Waktu (UTC)  | Waktu (WIB) | Keterangan                           |
| ------------- | ------------ | ----------- | ------------------------------------ |
| `0 8 * * *`   | 08:00        | 15:00       | Default (Setiap hari jam 3 sore WIB) |
| `0 1 * * *`   | 01:00        | 08:00       | Jam 8 pagi WIB                       |
| `0 12 * * *`  | 12:00        | 19:00       | Jam 7 malam WIB                      |
| `0 */6 * * *` | Setiap 6 jam | -           | Cek 4x sehari                        |
| `0 9 * * 1`   | 09:00 Senin  | 16:00 Senin | Setiap Senin                         |

> ⚠️ **Catatan:** Vercel menggunakan **UTC timezone**. WIB = UTC+7

### Ubah Jadwal Cron

Edit file `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/alerts",
      "schedule": "0 1 * * *" // Ubah ini (jam 8 pagi WIB)
    }
  ]
}
```

---

## 🔐 Keamanan

### Cara Kerja Authentication

1. **Vercel Cron** otomatis mengirim header:

   ```
   Authorization: Bearer <CRON_SECRET>
   ```

2. **API endpoint** (`/api/cron/alerts`) memverifikasi:

   ```typescript
   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
     return 401 Unauthorized
   }
   ```

3. Jika valid → Jalankan `runAlertCheck()`

### Testing Manual (Local)

```bash
# Test dengan secret yang benar
curl -H "Authorization: Bearer kR8mN2pQ7vL3xY9zA1bC4dE5fG6hJ8iK0lM" \
  http://localhost:3000/api/cron/alerts

# Test tanpa auth (harusnya 401)
curl http://localhost:3000/api/cron/alerts
```

---

## 📊 Monitoring Cron Jobs

### Melihat Log Eksekusi

1. **Vercel Dashboard** → Project → **Deployments**
2. Klik deployment terbaru → **Functions**
3. Cari `/api/cron/alerts` → Lihat logs

### Response Format

**Success (Ada alert):**

```json
{
  "ok": true,
  "message": "Alert terkirim untuk 3 item",
  "sent": true,
  "items": [...],
  "timestamp": "2025-11-19T08:00:00.000Z"
}
```

**Success (Tidak ada alert):**

```json
{
  "ok": true,
  "message": "Tidak ada alert yang perlu dikirim",
  "sent": false,
  "items": [],
  "timestamp": "2025-11-19T08:00:00.000Z"
}
```

**Error:**

```json
{
  "ok": false,
  "error": "SMTP env belum lengkap",
  "timestamp": "2025-11-19T08:00:00.000Z"
}
```

---

## 🧪 Testing

### 1. Test Manual dari Dashboard

Tombol **"Periksa & Kirim Alert"** di dashboard tetap berfungsi untuk trigger manual.

### 2. Test Cron Endpoint (Production)

```bash
# Ganti dengan CRON_SECRET Anda
curl -X GET https://your-app.vercel.app/api/cron/alerts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. Simulasi Cron Lokal

Install vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Kemudian di terminal lain:

```bash
curl -H "Authorization: Bearer your-local-secret" \
  http://localhost:3000/api/cron/alerts
```

---

## ❓ Troubleshooting

### Cron Job Tidak Muncul di Dashboard

- ✅ Pastikan `vercel.json` sudah di-commit
- ✅ Deploy ulang: `vercel --prod`
- ✅ Tunggu 1-2 menit untuk sinkronisasi

### Email Tidak Terkirim

1. **Cek SMTP credentials:**

   ```bash
   vercel env ls
   ```

2. **Cek logs di Vercel:**

   - Dashboard → Functions → `/api/cron/alerts`
   - Lihat error message

3. **Test manual SMTP:**
   - Gunakan tombol di dashboard
   - Lihat apakah email berhasil dikirim

### Cron Job Return 401 Unauthorized

- ❌ `CRON_SECRET` tidak match
- ✅ Re-generate secret dan update di Vercel
- ✅ Deploy ulang

### Cron Job Tidak Jalan Sesuai Jadwal

- ⏰ Pastikan timezone benar (UTC vs WIB)
- ⏰ Vercel Cron free tier: max **1 cron per project**
- ⏰ Minimal interval: **1 menit**
- ⏰ Tunggu jadwal berikutnya (bisa delay 1-2 menit)

---

## 📝 File-File Terkait

```
manajemen-pharmasi-main/
├── vercel.json                    # ⏰ Konfigurasi cron schedule
├── app/api/cron/alerts/route.ts   # 🔄 Endpoint yang dipanggil cron
├── app/api/alerts/run/route.ts    # 🔘 Endpoint manual dari dashboard
├── lib/alerts.ts                  # 📧 Logic pengecekan & kirim email
└── .env.example                   # 🔐 Template environment variables
```

---

## 🎯 Kesimpulan

Setelah setup selesai:

- ✅ **Otomatis:** Email alert terkirim setiap hari jam 8 pagi WIB
- ✅ **Manual:** Tombol di dashboard tetap bisa digunakan
- ✅ **Aman:** Dilindungi dengan CRON_SECRET
- ✅ **Gratis:** Vercel Cron tersedia di Hobby plan

**Next Steps:**

1. Generate `CRON_SECRET`
2. Add ke Vercel environment variables
3. Deploy ke production
4. Tunggu jadwal pertama & cek email! 📬

---

**🔗 Referensi:**

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
