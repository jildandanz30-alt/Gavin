# Gavin Store 🛒

Plugin & Jasa Minecraft Store — dibangun dengan Express.js + Clerk Auth.

---

## 🚀 Deploy ke Railway

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 2. Buat project di Railway
1. Buka [railway.app](https://railway.app) → **New Project**
2. Pilih **Deploy from GitHub repo** → pilih repo kamu
3. Railway akan otomatis detect Node.js dan build

### 3. Set Environment Variables di Railway
Buka tab **Variables** di Railway, lalu tambahkan:

| Key | Value |
|-----|-------|
| `CLERK_SECRET_KEY` | `sk_live_...` (dari Clerk Dashboard) |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` (dari Clerk Dashboard) |

> ⚠️ **WAJIB** — tanpa ini app akan crash (502 Bad Gateway)

### 4. Ambil Clerk Keys
1. Buka [dashboard.clerk.com](https://dashboard.clerk.com)
2. Pilih aplikasi kamu → **API Keys**
3. Copy **Secret key** dan **Publishable key**

---

## 🖥️ Jalankan Lokal

```bash
# Install dependencies
npm install

# Buat file .env
cp .env.example .env
# Edit .env → isi CLERK_SECRET_KEY dan CLERK_PUBLISHABLE_KEY

# Jalankan server
npm start
```

Server berjalan di `http://localhost:3000`

---

## 📁 Struktur File

```
├── server.js          # Backend Express
├── package.json       # Dependencies
├── railway.json       # Config Railway
├── nixpacks.toml      # Node version (Railway)
├── .env.example       # Template environment variables
├── .gitignore
├── data/              # File JSON (orders & products) — auto dibuat
└── public/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── products.html
    ├── checkout.html
    ├── orders.html
    ├── admin.html
    ├── style.css
    └── navbar.js
```

---

## ❗ Troubleshooting

**502 Bad Gateway di Railway?**
→ Cek tab **Deploy Logs** di Railway
→ Pastikan `CLERK_SECRET_KEY` sudah diset di Variables

**App crash saat start?**
→ Pastikan `CLERK_SECRET_KEY` valid (bukan key yang expired)
