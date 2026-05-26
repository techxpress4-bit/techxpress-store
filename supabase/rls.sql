-- ============================================================================
-- TECHXPRESS — Row Level Security (RLS) policies
-- ============================================================================
-- A exécuter UNE FOIS dans : Supabase dashboard → SQL Editor
-- https://supabase.com/dashboard/project/urvoucdrdyqjdcysogez/sql/new
--
-- Effet : la anon key publique (utilisée par le navigateur) ne pourra plus
-- ni lire ni écrire les commandes / avis. Seules les Pages Functions, qui
-- utilisent la SUPABASE_SERVICE_KEY (qui bypass la RLS), pourront le faire
-- après validation des données.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- 1. TABLE `commandes` — créée si manquante (idempotent)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.commandes (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete set null,
  email       text not null,
  prenom      text not null,
  nom         text not null,
  adresse     text not null,
  telephone   text not null,
  wilaya      text not null,
  message     text,
  items       jsonb not null,
  total       numeric(12, 2) not null,
  statut      text not null default 'en_attente',
  created_at  timestamptz not null default now()
);

create index if not exists commandes_user_id_idx  on public.commandes (user_id);
create index if not exists commandes_created_at_idx on public.commandes (created_at desc);

-- ──────────────────────────────────────────────────────────────────────────
-- 2. TABLE `avis` — créée si manquante (idempotent)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.avis (
  id            bigserial primary key,
  product_slug  text not null,
  auteur        text not null,
  note          smallint not null check (note between 1 and 5),
  texte         text,
  photos        text[],
  approuve      boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists avis_slug_idx on public.avis (product_slug, approuve, created_at desc);

-- ──────────────────────────────────────────────────────────────────────────
-- 3. ACTIVER RLS sur les deux tables
-- ──────────────────────────────────────────────────────────────────────────
alter table public.commandes enable row level security;
alter table public.avis      enable row level security;

-- Reset des policies existantes pour idempotence
drop policy if exists "commandes_anon_read"        on public.commandes;
drop policy if exists "commandes_anon_write"       on public.commandes;
drop policy if exists "commandes_own_select"       on public.commandes;
drop policy if exists "avis_anon_read_approved"    on public.avis;
drop policy if exists "avis_anon_write"            on public.avis;

-- ──────────────────────────────────────────────────────────────────────────
-- 4. POLICIES — `commandes`
-- ──────────────────────────────────────────────────────────────────────────
-- Utilisateur connecté : peut voir SES propres commandes (page /account)
-- Match user_id OU email pour récupérer aussi les commandes passées en
-- invité (user_id null) avec la même adresse email que le compte.
create policy "commandes_own_select"
  on public.commandes
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(email) = lower(auth.email())
  );

-- Anon : aucun accès (pas de SELECT, pas d'INSERT, pas d'UPDATE, pas de DELETE)
-- L'API /api/commande utilise la SUPABASE_SERVICE_KEY qui bypass la RLS,
-- donc les commandes continuent d'être insérées correctement côté serveur.

-- ──────────────────────────────────────────────────────────────────────────
-- 5. POLICIES — `avis`
-- ──────────────────────────────────────────────────────────────────────────
-- Tout le monde (anon + auth) : peut LIRE les avis approuvés
create policy "avis_anon_read_approved"
  on public.avis
  for select
  to anon, authenticated
  using ( approuve = true );

-- Anon : pas d'INSERT/UPDATE/DELETE
-- L'API /api/avis utilise la SUPABASE_SERVICE_KEY pour insérer après validation.

-- ──────────────────────────────────────────────────────────────────────────
-- 6. STORAGE — bucket avis-photos (public en lecture)
-- ──────────────────────────────────────────────────────────────────────────
-- Si le bucket n'existe pas déjà, le créer dans Storage → New bucket :
--   Name: avis-photos
--   Public: ✅ Yes (les photos d'avis doivent être lisibles sans auth)

-- ──────────────────────────────────────────────────────────────────────────
-- 7. VERIFICATION — exécuter à la fin pour confirmer
-- ──────────────────────────────────────────────────────────────────────────
-- Ces requêtes affichent les policies actives ; tu dois voir :
--   commandes : 1 policy "commandes_own_select"
--   avis      : 1 policy "avis_anon_read_approved"
-- et rowsecurity = true sur les deux tables.

select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in ('commandes', 'avis');

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename in ('commandes', 'avis')
order by tablename, policyname;
