# Desain UI/UX — CYLINDER ODYSSEY 3D

## Palet Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `navy` | `#172554` | Header, latar hero |
| `royal` | `#2563EB` | Tombol aksi utama, tautan |
| `sky` | `#60A5FA` | Selimut tabung 3D, panel visual |
| `purple` | `#A78BFA` | Aksen, sorotan info penting |
| `mint` | `#6EE7B7` | Jawaban benar, progres |
| `sun` | `#FACC15` | Tutup tabung, penghargaan |
| `orange` | `#FB923C` | Alas tabung |
| `paper` | `#F8FAFC` | Latar konten bacaan |
| `ink` | `#1E293B` | Teks utama |

Warna bagian tabung **konsisten di semua layar**: tutup kuning, alas oranye, selimut biru langit. Rumus diberi warna yang sama dengan bagiannya (mis. `πr²` tutup berwarna kuning) agar siswa langsung mengaitkan simbol dengan bagian benda.

## Tipografi
- Font: **Nunito** (judul, ramah) dan **Inter** (isi); fallback sistem.
- Ukuran dasar 16 px di HP, 17 px di desktop; judul kartu 20–24 px.
- Rumus memakai font monospace tabular agar angka sejajar.

## Tata Letak
- **Mobile-first.** Lebar 360–412 px: satu kolom, navigasi bawah (Beranda, Peta, Lab, Latihan, Game) di zona jempol.
- **≥ 768 px:** kartu materi dua kolom (visual kiri, teks kanan) → *spatial contiguity*.
- **≥ 1024 px:** header atas dengan navigasi penuh, konten maks 1100 px.
- Tombol minimal 44 × 44 px.

## Komponen Kunci
| Komponen | Catatan |
|---|---|
| `Companion` (Tubi) | Gelembung bicara kecil di atas/samping konten, bisa ditutup |
| `CylinderScene` | Kanvas 3D, rotasi seret/sentuh, zoom cubit, tombol reset kamera |
| `StepNav` | Sebelumnya · Ulangi · Lanjut; indikator titik langkah |
| `Highlighter` | Ketuk kata/frasa untuk menyorot; tombol “Sorot otomatis” menandai info penting |
| `HintPanel` | Hint 1 → 2 → 3 terbuka bertahap; pembahasan setelah semua hint |
| `FormulaBlock` | Rumus berwarna sesuai bagian tabung |

## Prinsip Anti-Beban-Kognitif
1. Satu konsep per kartu, maksimal 2–3 kalimat.
2. Tidak ada latar bergerak atau partikel dekoratif.
3. Animasi hanya untuk (a) transisi lembut 150–250 ms, (b) animasi yang menjelaskan konsep (bentangan jaring).
4. Kontras teks ≥ 4.5:1; konten bacaan di latar `paper`.
5. Umpan balik selalu dekat dengan input yang dinilai.

## Aksesibilitas
- Semua kontrol bisa diakses keyboard, fokus terlihat.
- Warna tidak menjadi satu-satunya pembeda (bagian tabung juga diberi label teks).
- `prefers-reduced-motion` mematikan animasi otomatis.
