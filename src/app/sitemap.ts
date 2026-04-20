import { MetadataRoute } from 'next'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rihlaride.com'
  
  // Use admin client for static generation to bypass RLS and auth context requirements
  // Standard createClient() relies on cookies which aren't available during build/sitemap generation
  const supabase = createAdminClient()

  const routes = [
    '',
    '/about',
    '/services',
    '/fleet',
    '/corporate',
    '/contact',
    '/point-to-point',
    '/airports',
    '/cities',
    '/drive',
    '/newsroom',
    '/investors',
    '/safety',
    '/diversity',
    '/sustainability',
    '/help',
    '/accessibility',
    '/privacy',
    '/terms',
    '/book',
    '/login',
    '/drive/register'
  ]

  const staticUrls = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const { data: posts } = await supabase.from('news_posts').select('slug, published_at')
  const dynamicUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/newsroom/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticUrls, ...dynamicUrls]
}
