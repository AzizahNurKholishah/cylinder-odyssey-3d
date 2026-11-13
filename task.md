# Task Board

## Tahap 1 — Dokumentasi & Spesifikasi ✅
- [x] prd.md, README.md, agents.md, architecture.md, task.md, design.md, api.md, database.md, pedagogy.md, deployment.md

## Tahap 2 — Database & Backend ✅
- [x] `supabase/schema.sql` (12 tabel, FK, indeks, CHECK, RLS); divalidasi di PostgreSQL (PGlite) dan aman dijalankan ulang
- [x] Konten: 4 level, 19 soal latihan (3 tingkat, 5 jenis), 4 soal literasi (skor 6/6/6/6 = 24), 5 game, 7 lencana
- [x] `scripts/generate_seed.py` → `supabase/seed.sql`
- [x] Repository Supabase REST + memori
- [x] Auth kode siswa (JWT, rate limit, access key guru)
- [x] Grading latihan + deteksi 15 jenis kesalahan umum
- [x] Penskoran parsial literasi per tahap
- [x] Gamifikasi (XP idempoten via `xp_key`, 8 misi, 7 lencana)
- [x] 42 tes pytest lulus

## Tahap 3 — Frontend ✅
- [x] Vite + React + Tailwind v4 + Lucide + Three.js (3D di-*lazy load*)
- [x] Landing, Login, Dashboard, Adventure Map
- [x] Halaman materi 4 level (kartu ≤3 kalimat, visual berdampingan, quick check, rangkuman & jebakan, Sebelumnya/Ulangi/Lanjut)
- [x] Cylinder Laboratory (3D rotasi, mode tutup, jaring-jaring 3D, dimension builder, kalkulator langkah)
- [x] Training Zone (diagnosis, Hint 1–3, pembahasan, refleksi, highlighter)
- [x] Cylinder Playground (5 game)
- [x] Final Challenge (skor parsial, tanpa kunci saat ujian, draf tersimpan otomatis)
- [x] Profil & Riwayat, Panel Guru
- [x] 7 tes vitest lulus, `npm run build` sukses

## Tahap 4 — Android & Pengujian
- [x] Capacitor Android (`frontend/android`, `cap sync` sukses)
- [x] Uji E2E di browser (Playwright, viewport HP 390px & desktop 1366px): login & validasi, klik bagian tabung 3D (raycasting), bentangan jaring-jaring, kalkulator, latihan + diagnosis + hint + refleksi, game, Final Challenge skor parsial, profil, XP tidak ganda, panel guru: semua lulus tanpa error console
- [ ] Build APK (butuh Android Studio / JDK 17+ di mesin pengembang, lihat deployment.md)
- [ ] Uji koneksi ke proyek Supabase sungguhan (butuh kredensial proyek)
- [ ] Uji sentuh di perangkat Android fisik

## Catatan untuk Peneliti
- Soal Final Challenge & rubrik kata kunci adalah draf pengembang; perlu validasi ahli terhadap kisi-kisi asli.
- Transkrip wawancara S01 tidak ada di repositori; pemetaan hanya memakai kode temuan dari spesifikasi.
