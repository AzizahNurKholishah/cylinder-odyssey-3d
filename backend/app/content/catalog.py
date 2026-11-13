"""Data katalog: level materi, game, lencana, dan akun contoh."""
from __future__ import annotations

LESSONS = [
    {"id": 1, "level_number": 1, "slug": "lembah-lingkaran", "order_index": 1,
     "title": "Lembah Lingkaran",
     "description": "Prasyarat lingkaran (r, d, keliling, luas, pilihan π) dan unsur-unsur tabung."},
    {"id": 2, "level_number": 2, "slug": "bengkel-jaring", "order_index": 2,
     "title": "Bengkel Jaring-Jaring",
     "description": "Membentangkan tabung dan menemukan asal angka 2 pada rumus 2πr(r + t)."},
    {"id": 3, "level_number": 3, "slug": "benteng-terbuka", "order_index": 3,
     "title": "Benteng Tabung Terbuka",
     "description": "Membedakan tabung tertutup, tanpa tutup, dan selimut saja."},
    {"id": 4, "level_number": 4, "slug": "puncak-literasi", "order_index": 4,
     "title": "Puncak Literasi Tabung",
     "description": "Strategi 4 langkah menyelesaikan soal cerita kontekstual."},
]

GAMES = [
    {"id": 1, "slug": "part-detector", "title": "Part Detector",
     "description": "Tebak kombinasi bagian permukaan benda nyata secepat mungkin."},
    {"id": 2, "slug": "radius-pi-sprint", "title": "Radius & Pi Sprint",
     "description": "Ubah diameter ke jari-jari dan pilih π paling efisien."},
    {"id": 3, "slug": "net-matcher", "title": "Net Matcher",
     "description": "Pilih selimut persegi panjang yang pas untuk tabung."},
    {"id": 4, "slug": "formula-builder", "title": "Formula Builder Challenge",
     "description": "Susun blok rumus dan substitusi dalam urutan yang benar."},
    {"id": 5, "slug": "cylinder-quest", "title": "Cylinder Quest Adventure",
     "description": "Bantu arsitek desa membuka 3 gerbang dengan luas permukaan tabung."},
]

ACHIEVEMENTS = [
    {"id": 1, "code": "circle_guardian", "title": "Circle Guardian", "icon_name": "circle-dot",
     "description": "Menuntaskan prasyarat lingkaran & unsur tabung (Level 01)."},
    {"id": 2, "code": "net_unfolder", "title": "Net Unfolder", "icon_name": "layers",
     "description": "Membentangkan jaring-jaring 3D hingga 100% di Cylinder Laboratory."},
    {"id": 3, "code": "formula_architect", "title": "Formula Architect", "icon_name": "sigma",
     "description": "Menemukan asal rumus 2πr(r + t) (Level 02)."},
    {"id": 4, "code": "open_top_specialist", "title": "Open-Top Specialist", "icon_name": "cup-soda",
     "description": "Menuntaskan misi tabung tanpa tutup (Level 03)."},
    {"id": 5, "code": "hint_free_solver", "title": "Hint-Free Solver", "icon_name": "zap",
     "description": "Menjawab benar 5 soal latihan tanpa membuka petunjuk."},
    {"id": 6, "code": "playground_explorer", "title": "Playground Explorer", "icon_name": "gamepad-2",
     "description": "Memainkan kelima mini games di Cylinder Playground."},
    {"id": 7, "code": "literacy_champion", "title": "Literacy Champion", "icon_name": "trophy",
     "description": "Menyelesaikan Evaluasi Akhir Mathematical Literacy."},
]

SAMPLE_PROFILES = [
    {"student_code": f"SMP8-{i:02d}", "full_name": f"Siswa {i:02d}", "class_name": "VIII", "role": "student"}
    for i in range(1, 31)
] + [
    {"student_code": "GURU-01", "full_name": "Guru Matematika", "class_name": "VIII", "role": "teacher"},
]
