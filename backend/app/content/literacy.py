"""Final Challenge — 4 soal Mathematical Literacy dengan skor parsial (total 24).

CATATAN: teks soal dan rubrik ini adalah DRAF PENGEMBANG yang mengikuti struktur
kisi-kisi (indikator, skor maks 6, jumlah tahap 5/6/4/6). Validasi oleh ahli/guru
terhadap instrumen asli diperlukan sebelum dipakai untuk pengambilan data penelitian.
"""
from __future__ import annotations

from app.content.builders import choice_step, number_step, radius_step, surface_step, text_step

INDICATORS = {
    "reasoning": "Mathematical Reasoning",
    "formulating": "Formulating Situations Mathematically",
    "employing": "Employing Mathematical Concepts, Facts, and Procedures",
    "evaluating": "Interpreting, Applying, and Evaluating Mathematical Outcomes",
}

LITERACY_QUESTIONS: list[dict] = [
    {
        "id": "LIT-1",
        "indicator": "reasoning",
        "title": "Desain Kaleng Paling Hemat Bahan",
        "story_text": (
            "Sebuah pabrik minuman sedang memilih desain kaleng tertutup. Desain A memiliki jari-jari 7 cm dan "
            "tinggi 10 cm. Desain B memiliki diameter 7 cm dan tinggi 40 cm. Kedua desain dapat menampung volume "
            "minuman yang sama, yaitu 1.540 cm³. Pabrik ingin memakai pelat kaleng sesedikit mungkin. "
            "Gunakan π = 22/7."
        ),
        "highlights": ["kaleng tertutup", "jari-jari 7 cm", "tinggi 10 cm", "diameter 7 cm", "tinggi 40 cm",
                       "pelat kaleng sesedikit mungkin", "π = 22/7"],
        "steps": [
            radius_step("r_b", 7, score=1) | {"prompt": "Tahap 1 — Berapa jari-jari kaleng desain B?"},
            surface_step("lp_a", "Tahap 2 — Berapa luas permukaan kaleng desain A?", 7, 10, "closed", "22/7"),
            surface_step("lp_b", "Tahap 3 — Berapa luas permukaan kaleng desain B?", 3.5, 40, "closed", "22/7",
                         given_d=True),
            choice_step("pilih", "Tahap 4 — Desain mana yang paling hemat bahan?",
                        [("a", "Desain A", None), ("b", "Desain B", "concept"),
                         ("c", "Sama saja karena volumenya sama", "concept")], "a"),
            text_step("alasan", "Tahap 5 — Jelaskan alasan matematis pilihanmu.",
                      [(["lebih kecil", "lebih sedikit", "lebih hemat", "lebih rendah", "paling kecil",
                         "paling sedikit", "kecil", "sedikit", "hemat"], 1),
                       (["748", "957", "209", "selisih"], 1)],
                      score=2,
                      model_answer=("Desain A lebih hemat karena luas permukaannya 748 cm², lebih kecil dari "
                                    "desain B (957 cm²). Selisihnya 209 cm², padahal volumenya sama.")),
        ],
        "explanation": (
            "r_B = 7 ÷ 2 = 3,5 cm.\n"
            "L_A = 2πr(r + t) = 2 × 22/7 × 7 × (7 + 10) = 44 × 17 = 748 cm².\n"
            "L_B = 2 × 22/7 × 3,5 × (3,5 + 40) = 22 × 43,5 = 957 cm².\n"
            "Volume sama, tetapi luas permukaan A lebih kecil (selisih 209 cm²), jadi desain A lebih hemat bahan."
        ),
    },
    {
        "id": "LIT-2",
        "indicator": "formulating",
        "title": "Cat untuk Tong Sampah Sekolah",
        "story_text": (
            "OSIS akan mengecat bagian luar 5 tong sampah tanpa tutup (alas dan sisi lengkung). Setiap tong "
            "berdiameter 56 cm dan tinggi 80 cm. Satu kaleng cat cukup untuk mengecat 2 m². OSIS sudah memiliki "
            "4 kaleng cat. Apakah cat tersebut cukup? Gunakan π = 22/7."
        ),
        "highlights": ["5 tong sampah", "tanpa tutup", "diameter 56 cm", "tinggi 80 cm", "2 m²", "4 kaleng cat",
                       "π = 22/7"],
        "steps": [
            choice_step("model", "Tahap 1 — Model matematika luas yang dicat untuk satu tong adalah ...",
                        [("a", "πr² + 2πrt", None), ("b", "2πr(r + t)", "closed_instead_of_open"),
                         ("c", "2πrt", "blanket_only"), ("d", "πr²t", "volume_confusion")], "a"),
            radius_step("r", 56) | {"prompt": "Tahap 2 — Berapa jari-jari tong?"},
            surface_step("lp_satu", "Tahap 3 — Luas yang dicat untuk 1 tong (cm²)?", 28, 80, "open", "22/7",
                         given_d=True),
            surface_step("lp_total", "Tahap 4 — Luas yang dicat untuk 5 tong (cm²)?", 28, 80, "open", "22/7",
                         given_d=True, multiplier=5),
            number_step("lp_m2", "Tahap 5 — Ubah luas total ke m².", 8.272, "m²",
                        [{"value": 827.2, "error_type": "unit_conversion"},
                         {"value": 82.72, "error_type": "unit_conversion"},
                         {"value": 1.6544, "error_type": "missing_quantity"}], tolerance=0.005),
            choice_step("cukup", "Tahap 6 — Kesimpulan: apakah 4 kaleng cat cukup?",
                        [("a", "Tidak cukup; 4 kaleng hanya untuk 8 m², perlu 5 kaleng", None),
                         ("b", "Cukup; 8,272 dibulatkan menjadi 8 m²", "rounding_down"),
                         ("c", "Cukup dan masih bersisa", "concept")], "a"),
        ],
        "explanation": (
            "Tong tanpa tutup → L = πr² + 2πrt, r = 56 ÷ 2 = 28 cm.\n"
            "1 tong = 22/7 × 28 × 28 + 2 × 22/7 × 28 × 80 = 2.464 + 14.080 = 16.544 cm².\n"
            "5 tong = 82.720 cm² = 8,272 m².\n"
            "4 kaleng hanya untuk 4 × 2 = 8 m² < 8,272 m² → TIDAK cukup; perlu 5 kaleng."
        ),
    },
    {
        "id": "LIT-3",
        "indicator": "employing",
        "title": "Kertas Kado Celengan",
        "story_text": (
            "Rani membuat 3 celengan berbentuk tabung dengan jari-jari 7 cm dan tinggi 15 cm. Bagian tutup dan "
            "selimut setiap celengan akan dilapisi kertas kado, sedangkan alasnya tidak. Biaya kertas kado "
            "Rp20 per cm². Berapa total biaya yang dibutuhkan Rani? Gunakan π = 22/7."
        ),
        "highlights": ["3 celengan", "jari-jari 7 cm", "tinggi 15 cm", "tutup dan selimut", "alasnya tidak",
                       "Rp20 per cm²", "π = 22/7"],
        "steps": [
            number_step("tutup", "Tahap 1 — Luas tutup 1 celengan (cm²)?", 154, "cm²",
                        [{"value": 308, "error_type": "closed_instead_of_open"},
                         {"value": 44, "error_type": "area_vs_circumference"},
                         {"value": 153.86, "error_type": "wrong_pi"}]),
            surface_step("selimut", "Tahap 2 — Luas selimut 1 celengan (cm²)?", 7, 15, "blanket", "22/7", score=2),
            surface_step("total", "Tahap 3 — Luas yang dilapisi untuk 1 celengan (cm²)?", 7, 15, "open", "22/7"),
            number_step("biaya", "Tahap 4 — Total biaya untuk 3 celengan (Rp)?", 48840, "Rp",
                        [{"value": 16280, "error_type": "missing_quantity"},
                         {"value": 58080, "error_type": "closed_instead_of_open"},
                         {"value": 39600, "error_type": "blanket_only"}], score=2, tolerance=1),
        ],
        "explanation": (
            "Tutup = 22/7 × 7 × 7 = 154 cm².\n"
            "Selimut = 2 × 22/7 × 7 × 15 = 660 cm².\n"
            "1 celengan = 154 + 660 = 814 cm² (alas tidak dihitung).\n"
            "3 celengan = 2.442 cm² × Rp20 = Rp48.840."
        ),
    },
    {
        "id": "LIT-4",
        "indicator": "evaluating",
        "title": "Klaim Lembaran Seng",
        "story_text": (
            "Pak Bima, seorang pengrajin, akan membuat 6 tabung air tertutup dari seng. Setiap tabung berjari-jari "
            "14 cm dan tinggi 50 cm. Satu lembar seng berukuran 100 cm × 50 cm. Setelah menghitung, Pak Bima "
            "mendapat hasil 6,76 lembar lalu berkata: \"Cukup beli 6 lembar saja, karena 6,76 dibulatkan menjadi 6.\" "
            "(Abaikan sisa potongan seng.) Gunakan π = 22/7."
        ),
        "highlights": ["6 tabung air tertutup", "jari-jari 14 cm", "tinggi 50 cm", "100 cm × 50 cm",
                       "Cukup beli 6 lembar saja", "π = 22/7"],
        "steps": [
            surface_step("lp_satu", "Tahap 1 — Luas permukaan 1 tabung (cm²)?", 14, 50, "closed", "22/7"),
            surface_step("lp_total", "Tahap 2 — Luas seng untuk 6 tabung (cm²)?", 14, 50, "closed", "22/7",
                         multiplier=6),
            number_step("lembar", "Tahap 3 — Banyak lembar seng hasil pembagian (boleh desimal)?", 6.7584, "lembar",
                        [{"value": 3.3792, "error_type": "unit_conversion"}], tolerance=0.01),
            choice_step("klaim", "Tahap 4 — Apakah klaim Pak Bima benar?",
                        [("a", "Tidak benar", None), ("b", "Benar", "rounding_down")], "a"),
            number_step("beli", "Tahap 5 — Berapa lembar seng yang sebenarnya harus dibeli?", 7, "lembar",
                        [{"value": 6, "error_type": "rounding_down"},
                         {"value": 6.76, "error_type": "rounding_not_applied"}], tolerance=0.01),
            text_step("alasan", "Tahap 6 — Berikan alasan kontekstual untuk jawabanmu.",
                      [(["kurang", "tidak cukup", "tidak akan cukup", "kekurangan", "ke atas", "keatas",
                         "30.000", "30000", "33.792", "33792", "tidak bisa", "belum cukup"], 1)],
                      score=1,
                      model_answer=("Jika hanya membeli 6 lembar (30.000 cm²), seng tidak cukup untuk 33.792 cm². "
                                    "Kebutuhan barang harus dibulatkan ke atas, jadi beli 7 lembar.")),
        ],
        "explanation": (
            "1 tabung = 2πr(r + t) = 2 × 22/7 × 14 × 64 = 5.632 cm².\n"
            "6 tabung = 33.792 cm². 1 lembar seng = 100 × 50 = 5.000 cm².\n"
            "33.792 ÷ 5.000 = 6,7584 lembar.\n"
            "Klaim salah: 6 lembar = 30.000 cm² < 33.792 cm² sehingga kurang. Barang yang dibeli harus dibulatkan "
            "ke atas → 7 lembar."
        ),
    },
]

for _q in LITERACY_QUESTIONS:
    _q["max_score"] = sum(s["score"] for s in _q["steps"])
    assert _q["max_score"] == 6, (_q["id"], _q["max_score"])

LITERACY_BY_ID = {q["id"]: q for q in LITERACY_QUESTIONS}
