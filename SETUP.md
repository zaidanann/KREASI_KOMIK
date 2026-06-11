# 🚀 PANDUAN SETUP JOTENG
## Platform Sosial Media Modern — Next.js 15

---

## 📋 PRASYARAT

Pastikan sudah terinstal:
- Node.js v18+ (cek: `node -v`)
- npm v9+ (cek: `npm -v`)
- Git (cek: `git --version`)
- VS Code (rekomendasi)

---

## ⚡ LANGKAH 1 — Install Dependencies

```bash
# Masuk ke folder proyek
cd joteng

# Install semua package
npm install

# Jika ada error, coba:
npm install --legacy-peer-deps
```

---

## 🗄️ LANGKAH 2 — Setup Database Neon PostgreSQL (GRATIS)

1. Buka https://neon.tech dan daftar akun gratis
2. Klik **"New Project"**
3. Isi nama project: `joteng`
4. Pilih region terdekat (Singapore)
5. Klik **"Create Project"**
6. Salin **Connection String** yang terlihat:
   ```
   postgresql://user:password@host/joteng?sslmode=require
   ```

---

## ☁️ LANGKAH 3 — Setup Cloudinary (GRATIS 25GB)

1. Buka https://cloudinary.com dan daftar gratis
2. Setelah login, buka **Dashboard**
3. Catat:
   - **Cloud Name** (contoh: `dxyz123abc`)
   - **API Key** (contoh: `123456789012345`)
   - **API Secret** (contoh: `abc123xyz...`)

---

## 📧 LANGKAH 4 — Setup Gmail SMTP

1. Buka https://myaccount.google.com
2. Klik **Security** → **2-Step Verification** → aktifkan
3. Scroll ke bawah → **App passwords**
4. Pilih App: **Mail**, Device: **Other** → isi `JOTENG`
5. Klik **Generate** → Salin 16 karakter (contoh: `abcd efgh ijkl mnop`)

---

## 🔐 LANGKAH 5 — Buat File .env.local

Buat file `.env.local` di root folder proyek:

```env
DATABASE_URL="postgresql://user:password@host/joteng?sslmode=require"

AUTH_SECRET="buat-random-panjang-minimal-32-karakter-bebas"
AUTH_URL="http://localhost:3000"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="nama_cloud_kamu"
CLOUDINARY_API_KEY="api_key_kamu"
CLOUDINARY_API_SECRET="api_secret_kamu"

GMAIL_USER="emailkamu@gmail.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="JOTENG"
```

> **AUTH_SECRET** bisa sembarang string panjang, contoh:
> `myJotengSuperSecretKey2025RandomString`

---

## 🔄 LANGKAH 6 — Setup Prisma & Database

```bash
# Generate Prisma Client
npm run db:generate

# Buat semua tabel di database
npm run db:push

# Isi data awal (super admin, admin, demo user)
npm run db:seed
```

Setelah seed, akun tersedia:
| Role        | Email                    | Password        |
|-------------|--------------------------|-----------------|
| Super Admin | superadmin@joteng.com    | SuperAdmin123!  |
| Admin       | admin@joteng.com         | Admin123!       |
| Demo User   | demo@joteng.com          | User123!        |

---

## ▶️ LANGKAH 7 — Jalankan Project

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🏗️ LANGKAH 8 — Build untuk Produksi

```bash
npm run build
npm run start
```

---

## 🌐 LANGKAH 9 — Deploy ke Vercel

### A. Persiapan
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login
```

### B. Push ke GitHub dulu
```bash
git init
git add .
git commit -m "Initial commit JOTENG"
git remote add origin https://github.com/username/joteng.git
git push -u origin main
```

### C. Deploy lewat Dashboard Vercel (lebih mudah)
1. Buka https://vercel.com → **Add New Project**
2. Pilih repository `joteng` dari GitHub
3. Klik **Environment Variables** → tambahkan SEMUA isi `.env.local`
   - Untuk `AUTH_URL`: ganti ke `https://domain-vercel-kamu.vercel.app`
4. Klik **Deploy**

### D. Setelah Deploy
- Vercel otomatis memberi domain: `joteng.vercel.app`
- Perbarui `AUTH_URL` di environment variable Vercel jika sudah ada domain

---

## 🌍 LANGKAH 10 — Custom Domain (Opsional)

1. Di dashboard Vercel → project JOTENG → **Settings** → **Domains**
2. Tambahkan domain kamu (contoh: `joteng.id`)
3. Ikuti instruksi DNS dari Vercel (tambahkan A record atau CNAME)
4. Perbarui `AUTH_URL` dan `NEXT_PUBLIC_APP_URL` di env Vercel

---

## 🔍 LANGKAH 11 — Daftarkan ke Google Search Console

1. Buka https://search.google.com/search-console
2. Tambahkan property → masukkan URL website kamu
3. Verifikasi kepemilikan (pilih metode HTML tag atau DNS)
4. Setelah terverifikasi, klik **Sitemap**
5. Masukkan: `https://domainmu.com/sitemap.xml`
6. Klik **Submit**

Sitemap otomatis tersedia di: `https://domainmu.com/sitemap.xml`

---

## 🔄 LANGKAH 12 — Update Setelah Deploy

Jika ada perubahan kode:
```bash
git add .
git commit -m "Update: deskripsi perubahan"
git push
```
Vercel otomatis redeploy setiap push ke branch `main`.

Jika ada perubahan schema database:
```bash
npm run db:push
```

---

## 💾 BACKUP & RESTORE DATABASE

### Backup (Neon Dashboard)
1. Buka https://console.neon.tech
2. Project kamu → **Branches** → branch `main`
3. Klik **Create Snapshot** untuk backup manual

### Backup via pg_dump
```bash
pg_dump "DATABASE_URL_kamu" > backup_joteng_$(date +%Y%m%d).sql
```

### Restore
```bash
psql "DATABASE_URL_baru" < backup_joteng.sql
```

---

## 📂 STRUKTUR HALAMAN

| URL                          | Halaman               | Akses        |
|------------------------------|-----------------------|--------------|
| `/`                          | Feed Utama            | Login        |
| `/explore`                   | Jelajahi              | Login        |
| `/create`                    | Buat Post             | Login        |
| `/chat`                      | Pesan                 | Login        |
| `/notifications`             | Notifikasi            | Login        |
| `/bookmarks`                 | Tersimpan             | Login        |
| `/profile/[username]`        | Profil User           | Login        |
| `/settings/profile`          | Edit Profil           | Login        |
| `/login`                     | Login                 | Public       |
| `/register`                  | Register              | Public       |
| `/verify-otp`                | Verifikasi OTP        | Public       |
| `/admin`                     | Admin Dashboard       | Admin+       |
| `/super-admin`               | Super Admin Dashboard | Super Admin  |

---

## 🛠️ TROUBLESHOOTING

**Error: Cannot find module '@prisma/client'**
```bash
npm run db:generate
```

**Error: Environment variable not found**
- Pastikan file `.env.local` ada di root folder
- Restart dev server setelah mengubah env

**Error: Invalid DATABASE_URL**
- Pastikan format URL benar dan `?sslmode=require` ada di akhir

**OTP email tidak terkirim**
- Pastikan App Password Gmail benar (bukan password biasa)
- Pastikan 2-Step Verification Gmail sudah aktif

**Upload file gagal**
- Cek Cloud Name, API Key, dan API Secret Cloudinary
- Pastikan tidak ada spasi ekstra di env variable

---

## 📞 AKUN DEFAULT SETELAH SEED

```
Super Admin → superadmin@joteng.com / SuperAdmin123!
Admin       → admin@joteng.com / Admin123!
User Demo   → demo@joteng.com / User123!
```

> Segera ganti password akun super admin setelah pertama login!
