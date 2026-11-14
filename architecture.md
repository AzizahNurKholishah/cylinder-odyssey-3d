# Arsitektur — CYLINDER ODYSSEY 3D

## Gambaran Umum

Aplikasi punya dua mode yang dipilih saat build:

- **Standalone (default):** `frontend/src/lib/engine/` (grading.js, localApi.js) menjalankan seluruh logika backend di perangkat, dengan penyimpanan `localStorage`. Konten soal/kunci/nilai jebakan berasal dari `src/content/generated/content.json`, hasil ekspor `backend/scripts/export_content.py`. Tes `test_frontend_content_export_is_up_to_date` memastikan keduanya selalu sinkron.
- **Server:** diagram di bawah ini.

`frontend/src/lib/api.js` memilih implementasi: `VITE_API_URL` kosong → API lokal; diisi → HTTP ke FastAPI. Bentuk respons keduanya identik.


```
┌────────────────────────────┐        HTTPS/JSON         ┌──────────────────────────┐      REST (service key)     ┌──────────────────────┐
│ Frontend (React + Vite)    │  ───────────────────────▶ │ Backend (FastAPI)        │ ─────────────────────────▶  │ Supabase PostgreSQL  │
│ Tailwind, Three.js, Lucide │  Authorization: Bearer    │ auth kode siswa, grading,│                             │ RLS aktif di semua   │
│ Web / Android (Capacitor)  │  <JWT sesi aplikasi>      │ skor parsial, XP, lencana│                             │ tabel                │
└────────────────────────────┘                           └──────────────────────────┘                             └──────────────────────┘
```

### Prinsip
1. **Frontend tidak pernah mengakses Supabase langsung.** Seluruh baca/tulis lewat backend. Frontend hanya butuh `VITE_API_URL`.
2. **Backend memegang kunci rahasia** (`SUPABASE_SERVICE_ROLE_KEY`) dari environment variable dan menegakkan aturan “siswa hanya mengakses datanya sendiri” berdasarkan `sub` pada token sesi.
3. **RLS tetap aktif** sebagai lapisan pertahanan kedua: role `anon`/`authenticated` tidak bisa membaca tabel siswa milik orang lain atau tabel soal (berisi kunci jawaban).
4. **Kunci jawaban tidak pernah dikirim ke frontend** sebelum dinilai. Backend mengirim versi soal yang sudah disanitasi.
5. **Satu sumber kebenaran konten**: konten soal, level, game, dan lencana didefinisikan di `backend/app/content/`, lalu `backend/scripts/generate_seed.py` menghasilkan `supabase/seed.sql`.

## Struktur Folder

```
.
├── backend/                 FastAPI (Python)
│   ├── app/
│   │   ├── main.py          app factory, CORS, router
│   │   ├── config.py        pengaturan dari env
│   │   ├── security.py      JWT sesi, dependency auth, rate limit login
│   │   ├── db/              repository: supabase_rest.py (produksi), memory.py (dev/test)
│   │   ├── content/         lessons, questions (latihan), literacy (evaluasi), games, achievements
│   │   ├── services/        cylinder_math, numbers, grading, literacy_scoring, gamification
│   │   └── routers/         auth, me, lessons, practice, evaluation, games, lab, admin
│   ├── scripts/generate_seed.py
│   └── tests/
├── frontend/                React + Vite + Tailwind + Three.js
│   ├── src/
│   │   ├── lib/             api client, rumus tabung, format angka
│   │   ├── context/         AuthContext
│   │   ├── components/      layout, ui, companion, three (CylinderScene), highlighter
│   │   ├── content/         kartu materi 4 level, data game
│   │   └── pages/           Landing, Login, Dashboard, Map, Lesson, Lab, Training, Playground, games/, Final, Profile, Admin
│   ├── android/             proyek Android (Capacitor)
│   └── capacitor.config.json
└── supabase/
    ├── schema.sql           tabel, FK, indeks, RLS
    └── seed.sql             data awal (hasil generate)
```

## Mode Penyimpanan Backend

| `DATA_BACKEND` | Kegunaan |
|---|---|
| `supabase` | Produksi. Memakai PostgREST Supabase dengan service key. |
| `memory` | Pengembangan lokal & pengujian otomatis. Data contoh dimuat dari `app/content`. Data hilang saat server dimatikan. |

Antarmuka repository (`select`, `insert`, `upsert`, `update`) identik pada kedua mode, sehingga logika bisnis tidak bergantung pada mode penyimpanan.

## Alur Autentikasi
1. Siswa mengetik kode → `POST /api/auth/login`.
2. Backend menormalkan kode (huruf besar, trim), memeriksa format, mencari di `profiles`.
3. Jika peran `teacher`, wajib menyertakan `access_key` yang cocok dengan `TEACHER_ACCESS_KEY`.
4. Backend menerbitkan JWT HS256 (`sub` = `profiles.id`, `role`, `exp` 12 jam).
5. Frontend menyimpan token dan mengirimnya di header `Authorization`.
6. Login dibatasi 10 percobaan/menit per IP.

## Idempotensi XP
Setiap pemberian XP ditulis ke `activity_logs` dengan `xp_key` unik per siswa (mis. `lesson:lembah-lingkaran`, `practice:TZ-B01`). Bila kunci sudah ada, XP tidak ditambahkan lagi. `user_stats.total_xp` dihitung ulang dari jumlah `xp_earned`, jadi refresh halaman atau klik ganda tidak menggandakan XP.

## Visualisasi 3D
`CylinderScene` (Three.js + OrbitControls) menggambar tabung dari tiga mesh: tutup, alas, dan selimut. Selimut adalah geometri kustom yang “menggulung” dengan jari-jari lengkung `R = r / (1 − u)` (u = persentase bentangan), sehingga transisi tabung → persegi panjang mulus. Tutup dan alas berputar pada engsel di tepi selimut. Komponen dimuat secara *lazy* agar halaman lain tetap ringan.
