import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load: PageServerLoad = async ({ locals, url }) => {
  const supabase = locals.supabase;

  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error || !artists) {
    console.error('Error loading artists:', error);
    return {
      grouped: {},
      totalArtists: 0,
      availableLetters: [],
      seo: {
        title: 'Browse Hentai Artists | NHentai',
        description: 'Browse hentai artists alphabetically',
        canonical: `https://nhentai.pics${url.pathname}`
      }
    };
  }

  // Group artists by first letter (A-Z or '#')
  const grouped: Record<string, { id: number; name: string; slug: string | null }[]> = {};

  for (const artist of artists) {
    const first = artist.name[0]?.toUpperCase();
    const letter = /^[A-Z]$/.test(first) ? first : '#';

    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(artist);
  }

  // Enhanced SEO data
  const totalArtists = artists.length;
  const availableLetters = Object.keys(grouped).sort();
  const popularArtists = artists.slice(0, 15).map(a => a.name).join(', ');

  return {
    grouped,
    totalArtists,
    availableLetters,
    seo: {
      title: `Browse ${totalArtists}+ Hentai Artists A-Z | NHentai`,
      description: `Explore ${totalArtists} hentai artists organized alphabetically. Find your favorite artists and their works. Popular artists: ${popularArtists.toLowerCase()}.`,
      canonical: `https://nhentai.pics${url.pathname}`,
      keywords: `hentai artists, manga artists, ${popularArtists.toLowerCase()}, hentai creators, artist list`,
      ogTitle: `${totalArtists}+ Hentai Artists | Browse A-Z`,
      ogDescription: `Complete collection of hentai artists organized alphabetically. Discover artists and their works from your favorite series.`,
      ogImage: 'https://nhentai.pics/images/artists-og.jpg',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Hentai Artists',
        description: `Browse our comprehensive collection of ${totalArtists} hentai artists organized alphabetically`,
        url: `https://nhentai.pics${url.pathname}`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: totalArtists,
          itemListElement: artists.slice(0, 25).map((artist, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Person',
              name: artist.name,
              url: `https://nhentai.pics/browse/artists/${artist.slug}`,
              inDefinedTermSet: {
                '@type': 'DefinedTermSet',
                name: 'Hentai Artists'
              }
            }
          }))
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://nhentai.pics'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Browse',
              item: 'https://nhentai.pics/browse'
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'Artists',
              item: `https://nhentai.pics${url.pathname}`
            }
          ]
        }
      }
    }
  };
};