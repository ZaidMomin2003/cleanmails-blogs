// Shared types — no Node.js imports, safe for client components

export interface PostFrontmatter {
  title: string
  slug: string
  date: string
  author: string
  tags: string[]
  category: string
  coverImage: string
  coverImageAlt: string
  excerpt: string
  readTime: string
  photographerName?: string
  photographerUrl?: string
}

export interface Post extends PostFrontmatter {
  content: string
  htmlContent: string
}

export type PostMeta = PostFrontmatter

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
