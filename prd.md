# PRD — CYLINDER ODYSSEY 3D (Jelajahi Tabung)

> **Tagline:** *Unfold the Cylinder, Master the Surface!*
> Aplikasi pembelajaran matematika berbasis permainan untuk siswa SMP Kelas VIII, materi **Luas Permukaan Tabung**.

## 1. Latar Belakang

Pengembangan mengikuti model **ADDIE**. Tahap *Analysis* memakai matriks analisis wawancara mendalam siswa (Informan `S01`) tentang **Cognitive Load** serta **kisi-kisi instrumen Mathematical Literacy**. Kode temuan yang dipakai di dokumen ini (IL, EL, GL, DS) mengacu pada matriks tersebut sebagaimana tercantum di spesifikasi proyek. Transkrip asli **tidak** disimpan di repositori ini dan tidak boleh dikarang ulang.

## 2. Tujuan Produk

| Tujuan | Ukuran keberhasilan |
|---|---|
| Siswa memahami asal rumus `2πr(r + t)` melalui jaring-jaring 3D | Misi Level 02 selesai + lencana *Formula Architect* |
| Siswa dapat membedakan tabung tertutup, tanpa tutup, dan selimut saja | Misi Level 03 + latihan Intermediate benar |
| Meningkatkan Mathematical Literacy (4 indikator) | Skor Final Challenge 0–24 tersimpan per indikator |
| Beban kognitif terkelola | Materi bertahap, maksimal 2–3 kalimat per kartu, visual berdampingan |

## 3. Pengguna

| Peran | Kebutuhan |
|---|---|
| **Siswa** (Kelas VIII) | Masuk dengan kode siswa, belajar bertahap, berlatih, bermain, evaluasi, melihat progres sendiri |
| **Guru/Admin** | Menambah & melihat kode siswa, memantau progres dan skor literasi |

## 4. Ruang Lingkup Fitur

### F1 — Autentikasi kode siswa
- Login dengan kode terdaftar (mis. `SMP8-01`), validasi kosong/format/tidak terdaftar, indikator loading.
- Akun guru memakai kode guru + *access key* tambahan.
- Sesi berupa token JWT dari backend (kadaluarsa 12 jam). Logout mudah ditemukan.

### F2 — Landing Page
Hero (logo, tagline, judul, deskripsi, ilustrasi tabung, tombol *MULAI PETUALANGAN* & *Masuk*), Tentang, Apa yang Dipelajari, Fitur Unggulan, Cara Menggunakan.

### F3 — Dashboard
Sapaan, kode & kelas, bar progres, XP & level, jumlah misi, lencana, aktivitas terakhir, rekomendasi misi berikutnya, peta ringkas 4 wilayah, tombol navigasi cepat.

### F4 — Adventure Map (4 Level)
| Level | Wilayah | Fokus |
|---|---|---|
| 01 | Lembah Lingkaran | Prasyarat lingkaran (r, d, K, L, pilihan π) & unsur tabung |
| 02 | Bengkel Jaring-Jaring | Membentangkan tabung, asal angka 2 pada rumus |
| 03 | Benteng Tabung Terbuka | Tertutup vs tanpa tutup vs selimut saja |
| 04 | Puncak Literasi Tabung | Strategi 4 langkah soal cerita kontekstual |

Level terbuka berurutan; level yang sudah terbuka bisa diulang kapan saja.

### F5 — Halaman Materi
Struktur 8 bagian (tujuan, kartu konsep ≤3 kalimat, visual berdampingan, contoh bilangan, contoh soal, *quick check*, rangkuman & jebakan, navigasi *Sebelumnya/Ulangi/Lanjut* + *Selesaikan Misi*).

### F6 — Cylinder Laboratory
- 3D Explorer (Three.js, rotasi sentuh/mouse, warna tutup kuning, alas oranye, selimut biru langit, mode Tertutup/Tanpa Tutup/Selimut Saja).
- 3D Unfolding Net (slider 0–100% + tombol animasi; panjang `2πr` dan lebar `t` dinamis).
- Dimension Builder (r, t, atau d; pemilihan π otomatis beserta alasannya).
- Kalkulator langkah demi langkah dengan validasi ketat.

### F7 — Training Zone
5 jenis soal (pilihan ganda diagnostik, benar/salah, isian berlangkah, identifikasi bagian, soal cerita + highlighter), 3 tingkat (Beginner/Intermediate/Expert). Jawaban salah → deteksi jenis kesalahan + petunjuk bertingkat (Hint 1→2→3) sebelum pembahasan. Pertanyaan refleksi setelah benar.

### F8 — Cylinder Playground (5 Mini Games)
Part Detector, Radius & Pi Sprint, Net Matcher, Formula Builder Challenge, Cylinder Quest Adventure. Masing-masing: petunjuk, aturan, skor, umpan balik edukatif, main ulang.

### F9 — Final Challenge
4 soal literasi (Reasoning, Formulating, Employing, Interpreting/Evaluating) masing-masing maks 6, total 24, penskoran parsial per tahap, tanpa kunci selama ujian, rangkuman per indikator + pembahasan setelah kirim, tersimpan di Supabase.

### F10 — Gamifikasi
XP, level penjelajah, 7 lencana (*Circle Guardian, Net Unfolder, Formula Architect, Open-Top Specialist, Hint-Free Solver, Playground Explorer, Literacy Champion*). XP idempoten (tidak bertambah karena refresh).

### F11 — Profil & Riwayat
Data diri, XP, level, lencana, grafik 4 indikator literasi, riwayat aktivitas, jumlah petunjuk yang dipakai.

### F12 — Panel Guru
Lihat daftar siswa + ringkasan progres, tambah kode siswa.

## 5. Kebutuhan Non-Fungsional
- *Mobile-first* 360–412 px, navigasi bawah untuk jempol, tablet & laptop.
- Bahasa Indonesia sederhana dan komunikatif.
- Tidak ada `SUPABASE_SERVICE_ROLE_KEY` di frontend.
- RLS aktif di seluruh tabel.
- Dapat dikemas sebagai APK Android (Capacitor).

## 6. Di Luar Ruang Lingkup (versi ini)
- Volume tabung, kerucut, dan bola.
- Penilaian esai oleh AI; jawaban alasan dinilai dengan rubrik kata kunci dan tetap tersimpan untuk ditinjau guru.
- Mode offline penuh.
