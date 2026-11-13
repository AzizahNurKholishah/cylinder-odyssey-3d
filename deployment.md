# Deployment

## 1. Supabase
1. Buat proyek di <https://supabase.com>.
2. Buka **SQL Editor** → jalankan isi `supabase/schema.sql`, lalu `supabase/seed.sql`.
3. Ambil dari **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (atau *secret key* `sb_secret_...`) → `SUPABASE_SERVICE_ROLE_KEY` (**hanya untuk backend**).

Bila konten soal diubah: `cd backend && python scripts/generate_seed.py`, lalu jalankan ulang `seed.sql` (aman diulang, memakai `on conflict do update`).

## 2. Backend (Render / Koyeb)
Variabel lingkungan:

| Nama | Contoh |
|---|---|
| `DATA_BACKEND` | `supabase` |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` / `sb_secret_...` |
| `JWT_SECRET` | string acak ≥ 32 karakter |
| `TEACHER_ACCESS_KEY` | kunci rahasia guru |
| `CORS_ORIGINS` | `https://app-anda.vercel.app,capacitor://localhost,https://localhost` |

**Render:** New → Web Service → root `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Atau gunakan `render.yaml` di root repo (Blueprint).

**Koyeb:** buat service dari GitHub, *work directory* `backend`, perintah run sama seperti di atas.

> Layanan gratis bisa “tidur” saat tidak dipakai; permintaan pertama bisa lambat ±30–60 detik.

## 3. Frontend (Vercel / Netlify / Cloudflare Pages)
- Root: `frontend`, build `npm run build`, output `dist`.
- Env: `VITE_API_URL=https://backend-anda.onrender.com`.
- Aktifkan SPA fallback (semua rute → `index.html`). File `frontend/public/_redirects` (Netlify) dan `frontend/vercel.json` sudah disediakan.

## 4. Android (Capacitor)
Prasyarat: Android Studio (JDK 17+ & Android SDK).

Folder `frontend/android` sudah dibuat (`npx cap add android`).

```bash
cd frontend
copy .env.production.example .env.production   # isi VITE_API_URL backend online (HTTPS)
npm run build
npx cap sync android
npx cap open android      # Build > Build APK(s)
```

Atau lewat terminal: `cd android && ./gradlew assembleDebug` → `android/app/build/outputs/apk/debug/app-debug.apk`.

Catatan:
- Gunakan backend **HTTPS**. Bila memakai backend lokal saat uji (`http://192.168.x.x:8000`), `capacitor.config.json` sudah mengizinkan cleartext untuk pengembangan; nonaktifkan untuk rilis.
- Tambahkan `https://localhost` dan `capacitor://localhost` ke `CORS_ORIGINS` backend.
