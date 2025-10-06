-- Temporarily disable Row Level Security on all tables
-- WARNING: This removes all security restrictions. Use only for testing/cleanup.

ALTER TABLE public.ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_characters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_languages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_parodies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parodies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.slug_map DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;

-- Optional: Drop all existing policies (they will be recreated when you re-enable RLS)
-- Uncomment the following lines if you want to completely reset the policies:

/*
-- Drop all existing policies
DROP POLICY IF EXISTS "Admin full access to ads" ON public.ads;
DROP POLICY IF EXISTS "Public read access to ads" ON public.ads;
DROP POLICY IF EXISTS "Admin full access to artists" ON public.artists;
DROP POLICY IF EXISTS "Public read access to artists" ON public.artists;
DROP POLICY IF EXISTS "Admin full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Admin full access to characters" ON public.characters;
DROP POLICY IF EXISTS "Public read access to characters" ON public.characters;
DROP POLICY IF EXISTS "Admin full access to groups" ON public.groups;
DROP POLICY IF EXISTS "Public read access to groups" ON public.groups;
DROP POLICY IF EXISTS "Admin full access to languages" ON public.languages;
DROP POLICY IF EXISTS "Public read access to languages" ON public.languages;
DROP POLICY IF EXISTS "Admin full access to manga" ON public.manga;
DROP POLICY IF EXISTS "Public read access to manga" ON public.manga;
DROP POLICY IF EXISTS "Admin full access to manga_artists" ON public.manga_artists;
DROP POLICY IF EXISTS "Public read access to manga_artists" ON public.manga_artists;
DROP POLICY IF EXISTS "Admin full access to manga_categories" ON public.manga_categories;
DROP POLICY IF EXISTS "Public read access to manga_categories" ON public.manga_categories;
DROP POLICY IF EXISTS "Admin full access to manga_characters" ON public.manga_characters;
DROP POLICY IF EXISTS "Public read access to manga_characters" ON public.manga_characters;
DROP POLICY IF EXISTS "Admin full access to manga_groups" ON public.manga_groups;
DROP POLICY IF EXISTS "Public read access to manga_groups" ON public.manga_groups;
DROP POLICY IF EXISTS "Admin full access to manga_languages" ON public.manga_languages;
DROP POLICY IF EXISTS "Public read access to manga_languages" ON public.manga_languages;
DROP POLICY IF EXISTS "Admin full access to manga_parodies" ON public.manga_parodies;
DROP POLICY IF EXISTS "Public read access to manga_parodies" ON public.manga_parodies;
DROP POLICY IF EXISTS "Admin full access to manga_tags" ON public.manga_tags;
DROP POLICY IF EXISTS "Public read access to manga_tags" ON public.manga_tags;
DROP POLICY IF EXISTS "Admin full access to pages" ON public.pages;
DROP POLICY IF EXISTS "Public read access to pages" ON public.pages;
DROP POLICY IF EXISTS "Admin full access to parodies" ON public.parodies;
DROP POLICY IF EXISTS "Public read access to parodies" ON public.parodies;
DROP POLICY IF EXISTS "Admin full access to slug_map" ON public.slug_map;
DROP POLICY IF EXISTS "Public read access to slug_map" ON public.slug_map;
DROP POLICY IF EXISTS "Admin full access to tags" ON public.tags;
DROP POLICY IF EXISTS "Public read access to tags" ON public.tags;
*/