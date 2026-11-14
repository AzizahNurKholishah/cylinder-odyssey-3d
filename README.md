# CYLINDER ODYSSEY 3D — Jelajahi Tabung

> *Unfold the Cylinder, Master the Surface!*

Aplikasi pembelajaran matematika berbasis permainan untuk siswa **SMP Kelas VIII**, materi **Luas Permukaan Tabung**. Siswa menjelajahi 4 wilayah petualangan, membentangkan jaring-jaring tabung 3D, berlatih dengan petunjuk bertingkat, bermain 5 mini games, lalu menyelesaikan evaluasi Mathematical Literacy (skor parsial, maks 24).

### ▶ Coba sekarang: **<https://azizahnurkholishah.github.io/cylinder-odyssey-3d/>**
Masuk dengan kode `SMP8-01` … `SMP8-30`. Tidak perlu server: aplikasi berjalan sepenuhnya di browser/HP dan progres tersimpan di perangkat.

## Fitur
- Login **kode siswa** + panel guru. Berjalan **standalone** (tanpa server, progres di `localStorage`) atau dengan backend FastAPI + Supabase.
- **Adventure Map** 4 level: Lembah Lingkaran → Bengkel Jaring-Jaring → Benteng Tabung Terbuka → Puncak Literasi.
- **Cylinder Laboratory**: model 3D Three.js (putar 360°, mode tertutup/tanpa tutup/selimut), jaring-jaring 3D dengan slider, dimension builder, kalkulator langkah demi langkah.
- **Training Zone**: 5 jenis soal, 3 tingkat, deteksi kesalahan umum, Hint 1–3, refleksi.
- **Cylinder Playground**: Part Detector, Radius & Pi Sprint, Net Matcher, Formula Builder, Cylinder Quest.
- **Final Challenge**: 4 indikator literasi matematis, skor parsial per tahap.
- XP, level, 7 lencana, profil & riwayat belajar.
- Responsif HP/tablet/laptop, dan dapat dikemas menjadi APK Android (Capacitor).

## Teknologi
| Lapisan | Teknologi |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Lucide React, Three.js |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL + RLS) |
| Android | Capacitor |

## Dua Mode Aplikasi

| Mode | Kapan aktif | Penyimpanan | Cocok untuk |
|---|---|---|---|
| **Standalone** (default) | `VITE_API_URL` kosong | `localStorage` di perangkat siswa | GitHub Pages, APK, tanpa konfigurasi server |
| **Server** | `VITE_API_URL` diisi | Supabase lewat backend FastAPI | Guru ingin memantau progres semua siswa dari satu tempat |

Pada mode standalone, logika penilaian (deteksi kesalahan, hint bertingkat, skor parsial, XP & lencana) berjalan di perangkat dan identik dengan backend: konten diekspor dari `backend/app/content` lewat `python backend/scripts/export_content.py`, dan kedua sisi diuji dengan skenario yang sama.

Batasan mode standalone: progres tidak berpindah antarperangkat, panel guru hanya melihat siswa yang belajar di perangkat itu, dan kunci jawaban ikut ada di kode aplikasi (bisa dibaca oleh pengguna yang paham teknis).

## Menjalankan Secara Lokal

### Cepat (standalone)
```bash
cd frontend
npm install
npm run dev
```
Buka <http://localhost:5173>.

### Dengan backend (opsional)

#### 1. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # sesuaikan bila perlu
uvicorn app.main:app --reload --port 8000
```
Default `DATA_BACKEND=memory` → langsung bisa dicoba tanpa Supabase (data contoh, hilang saat server berhenti). Ubah ke `supabase` dan isi kredensial untuk penyimpanan permanen.

#### 2. Frontend
Isi `VITE_API_URL=http://localhost:8000` di `frontend/.env`, lalu `npm run dev`.

### Akun Contoh
| Kode | Peran |
|---|---|
| `SMP8-01` … `SMP8-30` | Siswa |
| `GURU-01` + access key `guru-tabung-2026` (standalone; ubah lewat `VITE_TEACHER_ACCESS_KEY`) | Guru |

## Pengujian
```bash
cd backend && python -m pytest
cd frontend && npm test && npm run build
```

## Dokumentasi
[prd.md](prd.md) · [architecture.md](architecture.md) · [design.md](design.md) · [pedagogy.md](pedagogy.md) · [database.md](database.md) · [api.md](api.md) · [deployment.md](deployment.md) · [task.md](task.md) · [agents.md](agents.md)

## Catatan Penelitian
Desain aplikasi mengacu pada matriks wawancara Cognitive Load (Informan `S01`, model ADDIE) dan kisi-kisi Mathematical Literacy. Dokumen penelitian asli tidak disertakan di repositori. Soal Final Challenge adalah draf pengembang yang mengikuti struktur kisi-kisi dan perlu divalidasi sebelum dipakai untuk pengambilan data.
