-- =====================================================================
-- CYLINDER ODYSSEY 3D — Supabase schema
-- Jalankan di Supabase SQL Editor sebelum seed.sql.
-- Aman dijalankan ulang (if not exists / drop policy if exists).
-- =====================================================================

-- gen_random_uuid() bawaan PostgreSQL 13+ (Supabase), tidak perlu ekstensi tambahan.

-- ---------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  student_code  text not null unique check (student_code = upper(student_code) and length(student_code) between 3 and 20),
  full_name     text not null default '',
  class_name    text not null default 'VIII',
  role          text not null default 'student' check (role in ('student', 'teacher')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. lessons
-- ---------------------------------------------------------------------
create table if not exists public.lessons (
  id            integer primary key,
  level_number  integer not null unique check (level_number between 1 and 10),
  slug          text not null unique,
  title         text not null,
  description   text not null default '',
  order_index   integer not null
);

-- ---------------------------------------------------------------------
-- 3. lesson_progress
-- ---------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.profiles(id) on delete cascade,
  lesson_id     integer not null references public.lessons(id) on delete cascade,
  is_completed  boolean not null default false,
  completed_at  timestamptz,
  unique (student_id, lesson_id)
);

-- ---------------------------------------------------------------------
-- 4. questions (berisi kunci jawaban -> hanya backend)
-- ---------------------------------------------------------------------
create table if not exists public.questions (
  id              text primary key,
  category        text not null,               -- prasyarat | unsur | selimut | tertutup | tanpa_tutup | literasi_latihan | literacy
  difficulty      integer not null check (difficulty between 1 and 3),
  question_type   text not null check (question_type in ('multiple_choice','true_false','numeric_steps','identify_parts','story','literacy')),
  cylinder_type   text check (cylinder_type in ('closed','open','blanket')),
  title           text not null,
  story_text      text not null default '',
  highlights_json jsonb not null default '[]'::jsonb,
  steps_json      jsonb not null default '[]'::jsonb,
  hints_json      jsonb not null default '[]'::jsonb,
  explanation     text not null default '',
  max_score       integer not null default 1 check (max_score >= 0)
);

-- ---------------------------------------------------------------------
-- 5. practice_attempts
-- ---------------------------------------------------------------------
create table if not exists public.practice_attempts (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles(id) on delete cascade,
  question_id      text not null references public.questions(id) on delete cascade,
  is_correct       boolean not null default false,
  hints_used       integer not null default 0 check (hints_used between 0 and 3),
  error_type       text,
  reflection_text  text,
  answers_json     jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists practice_attempts_student_idx on public.practice_attempts(student_id, created_at desc);

-- ---------------------------------------------------------------------
-- 6. literacy_evaluations
-- ---------------------------------------------------------------------
create table if not exists public.literacy_evaluations (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles(id) on delete cascade,
  score_reasoning     numeric(3,1) not null check (score_reasoning between 0 and 6),
  score_formulating   numeric(3,1) not null check (score_formulating between 0 and 6),
  score_employing     numeric(3,1) not null check (score_employing between 0 and 6),
  score_evaluating    numeric(3,1) not null check (score_evaluating between 0 and 6),
  total_score         numeric(4,1) not null check (total_score between 0 and 24),
  answers_detail_json jsonb not null default '{}'::jsonb,
  completed_at        timestamptz not null default now()
);
create index if not exists literacy_evaluations_student_idx on public.literacy_evaluations(student_id, completed_at desc);

-- ---------------------------------------------------------------------
-- 7. games
-- ---------------------------------------------------------------------
create table if not exists public.games (
  id           integer primary key,
  slug         text not null unique,
  title        text not null,
  description  text not null default ''
);

-- ---------------------------------------------------------------------
-- 8. game_attempts
-- ---------------------------------------------------------------------
create table if not exists public.game_attempts (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  game_id     integer not null references public.games(id) on delete cascade,
  score       integer not null check (score between 0 and 100),
  played_at   timestamptz not null default now()
);
create index if not exists game_attempts_student_idx on public.game_attempts(student_id, played_at desc);

-- ---------------------------------------------------------------------
-- 9. user_stats
-- ---------------------------------------------------------------------
create table if not exists public.user_stats (
  student_id          uuid primary key references public.profiles(id) on delete cascade,
  total_xp            integer not null default 0 check (total_xp >= 0),
  current_level       integer not null default 1 check (current_level >= 1),
  missions_completed  integer not null default 0 check (missions_completed >= 0),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. achievements
-- ---------------------------------------------------------------------
create table if not exists public.achievements (
  id           integer primary key,
  code         text not null unique,
  title        text not null,
  description  text not null default '',
  icon_name    text not null default 'award'
);

-- ---------------------------------------------------------------------
-- 11. user_achievements
-- ---------------------------------------------------------------------
create table if not exists public.user_achievements (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  achievement_id  integer not null references public.achievements(id) on delete cascade,
  unlocked_at     timestamptz not null default now(),
  unique (student_id, achievement_id)
);

-- ---------------------------------------------------------------------
-- 12. activity_logs  (xp_key unik -> XP idempoten)
-- ---------------------------------------------------------------------
create table if not exists public.activity_logs (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  activity_type   text not null,
  activity_title  text not null,
  score_earned    numeric(6,1),
  xp_earned       integer not null default 0 check (xp_earned >= 0),
  xp_key          text,
  created_at      timestamptz not null default now(),
  unique (student_id, xp_key)
);
create index if not exists activity_logs_student_idx on public.activity_logs(student_id, created_at desc);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Backend memakai service role (melewati RLS). Kebijakan di bawah
-- mengamankan akses langsung dengan anon key / Supabase Auth.
-- =====================================================================
alter table public.profiles             enable row level security;
alter table public.lessons              enable row level security;
alter table public.lesson_progress      enable row level security;
alter table public.questions            enable row level security;
alter table public.practice_attempts    enable row level security;
alter table public.literacy_evaluations enable row level security;
alter table public.games                enable row level security;
alter table public.game_attempts        enable row level security;
alter table public.user_stats           enable row level security;
alter table public.achievements         enable row level security;
alter table public.user_achievements    enable row level security;
alter table public.activity_logs        enable row level security;

-- Konten publik (tanpa kunci jawaban)
drop policy if exists "lessons_public_read" on public.lessons;
create policy "lessons_public_read" on public.lessons for select to anon, authenticated using (true);

drop policy if exists "games_public_read" on public.games;
create policy "games_public_read" on public.games for select to anon, authenticated using (true);

drop policy if exists "achievements_public_read" on public.achievements;
create policy "achievements_public_read" on public.achievements for select to anon, authenticated using (true);

-- questions: TIDAK ada policy -> anon/authenticated tidak bisa membaca kunci jawaban.

-- Data pribadi: hanya pemilik
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select to authenticated using (id = auth.uid());

drop policy if exists "lesson_progress_self_read" on public.lesson_progress;
create policy "lesson_progress_self_read" on public.lesson_progress for select to authenticated using (student_id = auth.uid());

drop policy if exists "practice_attempts_self_read" on public.practice_attempts;
create policy "practice_attempts_self_read" on public.practice_attempts for select to authenticated using (student_id = auth.uid());

drop policy if exists "literacy_evaluations_self_read" on public.literacy_evaluations;
create policy "literacy_evaluations_self_read" on public.literacy_evaluations for select to authenticated using (student_id = auth.uid());

drop policy if exists "game_attempts_self_read" on public.game_attempts;
create policy "game_attempts_self_read" on public.game_attempts for select to authenticated using (student_id = auth.uid());

drop policy if exists "user_stats_self_read" on public.user_stats;
create policy "user_stats_self_read" on public.user_stats for select to authenticated using (student_id = auth.uid());

drop policy if exists "user_achievements_self_read" on public.user_achievements;
create policy "user_achievements_self_read" on public.user_achievements for select to authenticated using (student_id = auth.uid());

drop policy if exists "activity_logs_self_read" on public.activity_logs;
create policy "activity_logs_self_read" on public.activity_logs for select to authenticated using (student_id = auth.uid());

-- Penulisan hanya oleh backend (service role); tidak ada policy insert/update/delete untuk anon/authenticated.
