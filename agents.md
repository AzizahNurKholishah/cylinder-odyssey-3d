# agents.md — Panduan untuk Pengembang & Agen AI

Dokumen ini untuk siapa pun (manusia atau agen AI) yang melanjutkan pengembangan proyek.

## Aturan Wajib
1. **Jangan mengarang data penelitian.** Hasil wawancara, kebutuhan siswa, dan kisi-kisi hanya boleh diambil dari dokumen penelitian. Bila butuh data baru, tanyakan ke peneliti.
2. **Jangan menulis nama asli informan, siswa, atau pembuat** di kode, seed, maupun commit. Gunakan kode (`S01`, `SMP8-01`) dan nama generik (“Siswa 01”).
3. **Jangan meletakkan `SUPABASE_SERVICE_ROLE_KEY`** atau rahasia lain di `frontend/`. Frontend hanya boleh tahu `VITE_API_URL`.
4. **Kunci jawaban tidak boleh dikirim ke frontend** sebelum dinilai. Gunakan fungsi `sanitize_*` di backend.
5. **XP harus idempoten.** Selalu beri XP lewat `gamification.award_xp(...)` dengan `xp_key` unik.
6. Bahasa antarmuka: **Bahasa Indonesia** sederhana untuk siswa SMP.

## Peta Kode
| Ingin mengubah | Lokasi |
|---|---|
| Soal latihan | `backend/app/content/questions.py` → jalankan `python scripts/generate_seed.py` |
| Soal & rubrik Final Challenge | `backend/app/content/literacy.py` |
| Aturan XP, misi, lencana | `backend/app/services/gamification.py`, `backend/app/content/achievements.py` |
| Deteksi kesalahan | `backend/app/services/grading.py` |
| Kartu materi 4 level | `frontend/src/content/lessons.js` |
| Model 3D | `frontend/src/components/three/CylinderScene.jsx` |
| Rumus di frontend | `frontend/src/lib/cylinder.js` |

## Perintah
```bash
# backend
cd backend && python -m venv .venv && .venv/Scripts/activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload            # DATA_BACKEND=memory default
python -m pytest

# frontend
cd frontend && npm install && npm run dev
npm run build && npm test
```

## Definisi Selesai
- `python -m pytest` lulus.
- `npm run build` dan `npm test` di `frontend` tanpa error.
- Fitur baru tercatat di `task.md` dan, bila mengubah API/DB, di `api.md`/`database.md`.
