import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rihlalimo.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/dashboard/', 
        '/driver/',
        '/auth/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
