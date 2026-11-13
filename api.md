# API — Backend FastAPI

Base URL: `{VITE_API_URL}` (lokal: `http://localhost:8000`). Semua endpoint berawalan `/api`.
Endpoint privat membutuhkan header `Authorization: Bearer <token>`.
Dokumentasi interaktif otomatis: `/docs`.

## Auth
| Method | Path | Body | Respons |
|---|---|---|---|
| POST | `/api/auth/login` | `{ "student_code": "SMP8-01", "access_key"?: "..." }` | `{ token, profile }` |
| GET | `/api/auth/me` | – | `{ profile }` |

Kode error login: `400 empty_code`, `400 invalid_format`, `404 not_registered`, `401 access_key_required`, `401 invalid_access_key`, `429 too_many_attempts`.

## Dashboard & Profil
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/me/dashboard` | profil, stats (XP, level, judul level), daftar misi, progres %, lencana, aktivitas terakhir, rekomendasi, status level |
| GET | `/api/me/profile` | dashboard + skor literasi terakhir & terbaik, riwayat aktivitas, ringkasan latihan (benar, petunjuk), skor game terbaik |

## Materi
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/lessons` | daftar level + `is_unlocked`, `is_completed` |
| POST | `/api/lessons/{slug}/complete` | tandai selesai (403 bila level sebelumnya belum selesai), +50 XP sekali |

## Latihan (Training Zone)
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/practice/questions` | daftar soal tersanitasi + status siswa |
| GET | `/api/practice/questions/{id}` | satu soal tersanitasi (tanpa kunci) + hints |
| POST | `/api/practice/questions/{id}/attempt` | `{ answers: {step_id: value}, hints_used, reveal }` → `{ attempt_id, is_correct, error_type, step_results[], feedback, explanation?, xp_awarded, new_badges[] }` |
| POST | `/api/practice/attempts/{attempt_id}/reflection` | `{ text }` simpan refleksi |

`explanation` dikirim bila benar atau `reveal=true` setelah 3 petunjuk dibuka.

## Final Challenge
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/evaluation/questions` | 4 soal tersanitasi |
| POST | `/api/evaluation/submit` | `{ answers: { "LIT-1": { step_id: value } } }` → skor per indikator, total, rincian & pembahasan |
| GET | `/api/evaluation/latest` | hasil terakhir siswa |

## Games
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/games` | daftar game + skor terbaik siswa |
| POST | `/api/games/{slug}/attempts` | `{ score }` (0–100) → XP & lencana |

## Lab
| Method | Path | Keterangan |
|---|---|---|
| POST | `/api/lab/explored` | `{ feature: "unfold" }` → lencana *Net Unfolder* |
| POST | `/api/lab/calculate` | `{ input_type: "r"\|"d", value, height, cylinder_type }` → langkah perhitungan (validasi ketat) |

## Admin (peran `teacher`)
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/admin/students` | daftar siswa + XP, misi, skor literasi terakhir |
| POST | `/api/admin/students` | `{ student_code, full_name, class_name }` |

## Format Error
```json
{ "detail": { "code": "not_registered", "message": "Kode siswa tidak terdaftar." } }
```
