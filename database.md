# Database — Supabase (PostgreSQL)

File: [`supabase/schema.sql`](supabase/schema.sql) (struktur + RLS) dan [`supabase/seed.sql`](supabase/seed.sql) (data awal, dihasilkan oleh `backend/scripts/generate_seed.py`).

## Tabel

| Tabel | Kolom utama | Catatan |
|---|---|---|
| `profiles` | `id uuid PK`, `student_code text UNIQUE`, `full_name`, `class_name`, `role ('student'\|'teacher')`, `created_at` | Kode disimpan huruf besar |
| `lessons` | `id int PK`, `level_number`, `slug UNIQUE`, `title`, `description`, `order_index` | 4 level |
| `lesson_progress` | `id`, `student_id → profiles`, `lesson_id → lessons`, `is_completed`, `completed_at` | `UNIQUE(student_id, lesson_id)` |
| `questions` | `id text PK`, `category`, `difficulty`, `question_type`, `cylinder_type`, `title`, `story_text`, `highlights_json`, `steps_json`, `hints_json`, `explanation`, `max_score` | Berisi kunci jawaban → **tidak** dapat dibaca anon |
| `practice_attempts` | `id`, `student_id`, `question_id → questions`, `is_correct`, `hints_used`, `error_type`, `reflection_text`, `answers_json`, `created_at` | |
| `literacy_evaluations` | `id`, `student_id`, `score_reasoning`, `score_formulating`, `score_employing`, `score_evaluating`, `total_score`, `answers_detail_json`, `completed_at` | CHECK 0–6 per indikator, 0–24 total |
| `games` | `id int PK`, `slug UNIQUE`, `title`, `description` | 5 game |
| `game_attempts` | `id`, `student_id`, `game_id → games`, `score`, `played_at` | |
| `user_stats` | `student_id PK → profiles`, `total_xp`, `current_level`, `missions_completed`, `updated_at` | |
| `achievements` | `id int PK`, `code UNIQUE`, `title`, `description`, `icon_name` | 7 lencana |
| `user_achievements` | `id`, `student_id`, `achievement_id`, `unlocked_at` | `UNIQUE(student_id, achievement_id)` |
| `activity_logs` | `id`, `student_id`, `activity_type`, `activity_title`, `score_earned`, `xp_earned`, `xp_key`, `created_at` | `UNIQUE(student_id, xp_key)` → XP idempoten |

Tambahan dari spesifikasi awal: `questions.explanation`, `practice_attempts.answers_json`, `activity_logs.xp_earned`, `activity_logs.xp_key`.

## Struktur JSON `questions.steps_json`

```json
[
  {
    "id": "r",
    "prompt": "Berapa jari-jari tabung?",
    "kind": "number | choice | text",
    "unit": "cm",
    "answer": 14,
    "options": [{"id": "a", "text": "..." , "error_type": "diameter_as_radius"}],
    "errors": [{"value": 28, "error_type": "diameter_as_radius"}],
    "keywords": [["lebih kecil", "hemat"]],
    "score": 1
  }
]
```

## Row Level Security

RLS **aktif di semua tabel**.

| Tabel | anon | authenticated | service_role (backend) |
|---|---|---|---|
| `lessons`, `games`, `achievements` | SELECT | SELECT | penuh |
| `questions` | ✗ | ✗ | penuh |
| `profiles` | ✗ | SELECT baris sendiri (`id = auth.uid()`) | penuh |
| tabel siswa lain | ✗ | SELECT baris sendiri (`student_id = auth.uid()`) | penuh |

Backend memakai service key (melewati RLS) dan menegakkan kepemilikan data berdasarkan token sesi. Kebijakan `authenticated` disiapkan bila kelak frontend memakai Supabase Auth secara langsung.

## Menambah Siswa
- Lewat Panel Guru di aplikasi, atau
- SQL: `insert into profiles (student_code, full_name, class_name) values ('SMP8-31', 'Siswa 31', 'VIII');`
