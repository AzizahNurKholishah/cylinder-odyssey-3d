# CYLINDER ODYSSEY 3D — Jelajahi Tabung

> *Unfold the Cylinder, Master the Surface!*

Aplikasi pembelajaran matematika berbasis permainan untuk siswa **SMP Kelas VIII**, materi **Luas Permukaan Tabung**. Siswa menjelajahi 4 wilayah petualangan, membentangkan jaring-jaring tabung 3D, berlatih dengan petunjuk bertingkat, bermain 5 mini games, lalu menyelesaikan evaluasi Mathematical Literacy (skor parsial, maks 24).

## Fitur
- Login **kode siswa** (data di Supabase) + panel guru.
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

## Menjalankan Secara Lokal

### 1. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # sesuaikan bila perlu
uvicorn app.main:app --reload --port 8000
```
Default `DATA_BACKEND=memory` → langsung bisa dicoba tanpa Supabase (data contoh, hilang saat server berhenti). Ubah ke `supabase` dan isi kredensial untuk penyimpanan permanen.

### 2. Frontend
```bash
cd frontend
npm install
copy .env.example .env          # VITE_API_URL=http://localhost:8000
npm run dev
```
Buka <http://localhost:5173>.

### Akun Contoh
| Kode | Peran |
|---|---|
| `SMP8-01` … `SMP8-30` | Siswa |
| `GURU-01` + access key (`TEACHER_ACCESS_KEY`, default dev: `guru-dev-123`) | Guru |

## Pengujian
```bash
cd backend && python -m pytest
cd frontend && npm test && npm run build
```

## Dokumentasi
[prd.md](prd.md) · [architecture.md](architecture.md) · [design.md](design.md) · [pedagogy.md](pedagogy.md) · [database.md](database.md) · [api.md](api.md) · [deployment.md](deployment.md) · [task.md](task.md) · [agents.md](agents.md)

## Catatan Penelitian
Desain aplikasi mengacu pada matriks wawancara Cognitive Load (Informan `S01`, model ADDIE) dan kisi-kisi Mathematical Literacy. Dokumen penelitian asli tidak disertakan di repositori. Soal Final Challenge adalah draf pengembang yang mengikuti struktur kisi-kisi dan perlu divalidasi sebelum dipakai untuk pengambilan data.
