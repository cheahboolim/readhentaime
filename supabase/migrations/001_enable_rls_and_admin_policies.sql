-- Enable Row Level Security on all tables
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_parodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slug_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for admin user (cheahboolim@gmail.com)
-- Admin user (UUID: 0fb5f13b-bd1e-417a-9a75-add077e54451) gets full access

-- Ads table policies
CREATE POLICY "Admin full access to ads" ON public.ads
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to ads" ON public.ads
  FOR SELECT USING (enabled = true);

-- Artists table policies  
CREATE POLICY "Admin full access to artists" ON public.artists
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to artists" ON public.artists
  FOR SELECT USING (true);

-- Categories table policies
CREATE POLICY "Admin full access to categories" ON public.categories
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to categories" ON public.categories
  FOR SELECT USING (true);

-- Characters table policies
CREATE POLICY "Admin full access to characters" ON public.characters
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to characters" ON public.characters
  FOR SELECT USING (true);

-- Groups table policies
CREATE POLICY "Admin full access to groups" ON public.groups
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to groups" ON public.groups
  FOR SELECT USING (true);

-- Languages table policies
CREATE POLICY "Admin full access to languages" ON public.languages
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to languages" ON public.languages
  FOR SELECT USING (true);

-- Manga table policies
CREATE POLICY "Admin full access to manga" ON public.manga
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga" ON public.manga
  FOR SELECT USING (true);

-- Manga relationships policies
CREATE POLICY "Admin full access to manga_artists" ON public.manga_artists
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga_artists" ON public.manga_artists
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to manga_categories" ON public.manga_categories
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga_categories" ON public.manga_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to manga_characters" ON public.manga_characters
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga_characters" ON public.manga_characters
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to manga_groups" ON public.manga_groups
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga_groups" ON public.manga_groups
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to manga_languages" ON public.manga_languages
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga_languages" ON public.manga_languages
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to manga_parodies" ON public.manga_parodies
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga_parodies" ON public.manga_parodies
  FOR SELECT USING (true);

CREATE POLICY "Admin full access to manga_tags" ON public.manga_tags
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to manga_tags" ON public.manga_tags
  FOR SELECT USING (true);

-- Pages table policies
CREATE POLICY "Admin full access to pages" ON public.pages
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to pages" ON public.pages
  FOR SELECT USING (true);

-- Parodies table policies
CREATE POLICY "Admin full access to parodies" ON public.parodies
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to parodies" ON public.parodies
  FOR SELECT USING (true);

-- Slug map table policies
CREATE POLICY "Admin full access to slug_map" ON public.slug_map
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to slug_map" ON public.slug_map
  FOR SELECT USING (true);

-- Tags table policies
CREATE POLICY "Admin full access to tags" ON public.tags
  FOR ALL USING (auth.uid() = '0fb5f13b-bd1e-417a-9a75-add077e54451'::uuid);

CREATE POLICY "Public read access to tags" ON public.tags
  FOR SELECT USING (true);

-- Grant necessary permissions to authenticated users for reading
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant full permissions to admin user
-- Note: The admin will need to be authenticated to use these permissions