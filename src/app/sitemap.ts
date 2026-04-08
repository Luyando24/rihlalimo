import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rihlalimo.com'
  const supabase = await createClient()

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
    '/book',
    '/login'
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
