// Server-only — uses Node.js fs. Do NOT import in Client Components.
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import type { PostFrontmatter, Post, PostMeta } from './types'

export type { PostFrontmatter, Post, PostMeta }
export { formatDate } from './types'

const postsDir = path.join(process.cwd(), 'content/posts')

function ensureDir() {
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true })
}

export function getAllPostSlugs(): string[] {
  ensureDir()
  return fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx?$/, ''))
}

export function getAllPosts(): PostMeta[] {
  ensureDir()
  const slugs = getAllPostSlugs()
  const posts = slugs.map(slug => {
    const mdxPath = path.join(postsDir, `${slug}.mdx`)
    const mdPath  = path.join(postsDir, `${slug}.md`)
    const file = fs.existsSync(mdxPath) ? mdxPath : mdPath
    const { data } = matter(fs.readFileSync(file, 'utf8'))
    return { ...(data as PostFrontmatter), slug: data.slug || slug }
  })
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  ensureDir()
  const mdxPath = path.join(postsDir, `${slug}.mdx`)
  const mdPath  = path.join(postsDir, `${slug}.md`)
  const file = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null
  if (!file) return null

  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content)

  return {
    ...(data as PostFrontmatter),
    slug: data.slug || slug,
    content,
    htmlContent: processed.toString(),
  }
}

export function getAllCategories(): string[] {
  return [...new Set(getAllPosts().map(p => p.category).filter(Boolean))]
}
