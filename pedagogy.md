# Pedagogi — Dasar Desain Pembelajaran

> Dokumen ini memetakan kode temuan wawancara (Informan `S01`, model ADDIE) dan kisi-kisi Mathematical Literacy ke fitur aplikasi.
> **Catatan integritas:** transkrip dan matriks wawancara asli tidak ada di repositori. Tabel di bawah hanya memakai kode temuan beserta maknanya sebagaimana tercantum di spesifikasi proyek. Jangan menambahkan kutipan atau temuan yang tidak ada di dokumen penelitian.

## 1. Pemetaan Cognitive Load → Fitur

### Intrinsic Load (mengelola kompleksitas materi)
| Kode | Kebutuhan | Implementasi |
|---|---|---|
| IL03 | Prasyarat lingkaran sebelum tabung | Level 01 Lembah Lingkaran (r, d, K, L, pilihan π); game Radius & Pi Sprint |
| IL01 | Bukti asal angka 2 pada rumus | Level 02 + slider jaring-jaring 3D di Lab; kartu penurunan `πr² + πr² = 2πr²` |
| IL04 | Latihan tertutup vs tanpa tutup dipisah bertingkat | Level 03; Training Zone memisahkan soal tertutup (Intermediate) dan tanpa tutup; toggle tutup 3D |

### Extraneous Load (mengurangi beban yang tidak perlu)
| Kode | Kebutuhan | Implementasi |
|---|---|---|
| EL03, DS03 | Tampilan sederhana, tanpa animasi dekoratif | Palet terbatas, satu fokus per kartu, animasi hanya transisi lembut & animasi yang menjelaskan konsep (bentangan jaring) |
| EL02 | Teks & visual dalam satu area pandang | Kartu materi: visual dan penjelasan berdampingan (desktop) atau bertumpuk rapat (HP); rumus tepat di bawah model 3D di Lab |
| EL04 | Kontrol kecepatan oleh siswa | Tombol *Sebelumnya / Ulangi / Lanjut*, tidak ada auto-advance |
| EL05 | Penyorot kata kunci soal cerita | Komponen `Highlighter` di Level 04, Training Zone, dan Final Challenge |

### Germane Load (mendorong pemrosesan bermakna)
| Kode | Kebutuhan | Implementasi |
|---|---|---|
| GL01, DS01 | Eksplorasi aktif model 3D | Klik bagian tabung (Level 01), slider bentangan, Dimension Builder |
| GL02 | Pemeriksaan ulang rumus, hitungan, satuan | Langkah “Cek Satuan” di soal berlangkah, kalkulator menampilkan *Diketahui → Rumus → Substitusi → Hasil* |
| GL03, DS02 | Petunjuk langkah demi langkah saat salah | Deteksi jenis kesalahan + Hint 1 → 2 → 3 → pembahasan |
| GL04, GL05 | Refleksi alasan & variasi konteks | Pertanyaan “Mengapa kamu memilih rumus tersebut?” setelah jawaban benar; konteks kaleng, gelas, drum, paralon, tong, celengan, seng |

## 2. Deteksi Kesalahan Umum (Diagnostik)

| `error_type` | Deskripsi | Cara deteksi |
|---|---|---|
| `diameter_as_radius` | Memakai d sebagai r | Jawaban cocok dengan hasil hitung memakai r = d |
| `closed_instead_of_open` | Menghitung tutup pada tabung tanpa tutup | Jawaban cocok dengan `2πr(r+t)` padahal soal tanpa tutup |
| `open_instead_of_closed` | Lupa menghitung tutup | Jawaban cocok dengan `πr² + 2πrt` padahal soal tertutup |
| `blanket_only` | Hanya menghitung selimut | Jawaban cocok dengan `2πrt` |
| `wrong_pi` | Memakai π berbeda dari yang diminta | Jawaban cocok dengan π alternatif |
| `forgot_two` | Lupa angka 2 (selimut `πrt` / keliling `πr`) | Jawaban cocok dengan versi tanpa faktor 2 |
| `radius_squared_missing` | Luas lingkaran dihitung `πr` atau `2πr` | Jawaban cocok dengan keliling |
| `unit_conversion` | Salah konversi cm² ↔ m² | Jawaban berbeda faktor 100 atau 10.000 |
| `rounding_down` | Membulatkan ke bawah pada konteks kebutuhan barang | Jawaban = floor dari hasil yang seharusnya dibulatkan ke atas |
| `concept` | Kesalahan konsep (pilihan ganda/benar-salah) | Opsi pengecoh diberi label jenis kesalahan |

## 3. Kisi-Kisi Final Challenge (Skor Parsial)

| No | Indikator | Konteks | Tahap | Skor |
|---|---|---|---|---|
| 1 | Mathematical Reasoning | Membandingkan 2 desain kaleng (volume sama) untuk menghemat bahan | 5 | 6 |
| 2 | Formulating Situations Mathematically | Pengecatan 5 tong sampah tanpa tutup & kecukupan cat | 6 | 6 |
| 3 | Employing Concepts, Facts, Procedures | Pelapisan kertas kado celengan & total biaya | 4 | 6 |
| 4 | Interpreting, Applying, Evaluating | Evaluasi klaim pembulatan ke bawah lembaran seng | 6 | 6 |
| | | | **Total** | **24** |

Rincian rubrik per tahap ada di `backend/app/content/literacy.py`. Isi soal adalah **draf pengembang** yang mengikuti struktur kisi-kisi; teks dan rubrik perlu divalidasi ahli/guru terhadap instrumen asli sebelum dipakai untuk pengambilan data penelitian.

Jawaban berupa alasan dinilai otomatis dengan rubrik kata kunci, dan teks aslinya tetap disimpan di `answers_detail_json` agar guru dapat meninjau ulang.

## 4. Karakter Pendamping “Tubi”
Tubi adalah robot berbentuk tabung yang ramah. Perannya:
- Sapaan & tujuan belajar di awal setiap halaman.
- Pengingat anti-jebakan (r = d ÷ 2, kondisi tutup, satuan cm²).
- Petunjuk bertahap saat salah.
- Pertanyaan refleksi setelah benar.

Gaya bahasa: santai, singkat, menyemangati, tidak menghakimi.
