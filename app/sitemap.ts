import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  return [
    { url: 'https://coldmail.host/blog', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...posts.map(p => ({
      url: `https://coldmail.host/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
