import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAllPostSlugs, getPostBySlug, getAllPosts, formatDate } from '@/lib/posts'
import ArticleContent from '@/components/ArticleContent'
import CTA from '@/components/CTA'
import PostCard from '@/components/PostCard'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamicParams = true

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      url: `https://cleanmails.online/blog/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.coverImageAlt || post.title }] : [],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const related = allPosts
    .filter(p => p.slug !== post.slug && (p.category === post.category || p.tags?.some(t => post.tags?.includes(t))))
    .slice(0, 3)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Cleanmails', url: 'https://cleanmails.online' },
    publisher: { '@type': 'Organization', name: 'Cleanmails', url: 'https://cleanmails.online' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="min-h-screen bg-[var(--bg)] transition-colors">
        {/* ── Sticky nav ─────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)]">
          <div className="container flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5 no-underline group">
              <div className="w-8 h-8 bg-[#37352f] dark:bg-[#e8e8e6] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
                  <path d="M2 9l10 6 10-6" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-[14px] font-semibold text-[var(--text)]">Cleanmails</span>
                <span className="text-[14px] text-[var(--text-tertiary)] ml-1.5">/</span>
                <span className="text-[14px] text-[var(--text-tertiary)] ml-1.5">Blog</span>
              </div>
            </Link>
            <div className="flex items-center gap-2.5">
              <Link href="/" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors hidden sm:inline">
                All posts
              </Link>
              <ThemeToggle />
              <a
                href="https://cleanmails.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-[#37352f] bg-[#FFD700] hover:bg-[#f0cc00] px-3.5 py-1.5 rounded-md transition-colors no-underline"
              >
                Get Cleanmails
              </a>
            </div>
          </div>
        </nav>

        {/* ── Cover image ────────────────────────────────── */}
        {post.coverImage && (
          <div className="w-full overflow-hidden relative">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              width={1400}
              height={420}
              className="w-full h-[240px] sm:h-[320px] md:h-[400px] object-cover"
              priority
            />
            {post.photographerName && (
              <a
                href={post.photographerUrl || 'https://unsplash.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-4 text-[10px] text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded no-underline"
              >
                📷 {post.photographerName} / Unsplash
              </a>
            )}
          </div>
        )}

        {/* ── Article ────────────────────────────────────── */}
        <article className="container pt-8 sm:pt-10 pb-4">
          {post.category && (
            <Link
              href={`/?category=${encodeURIComponent(post.category)}`}
              className="inline-block text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--tag-bg)] hover:bg-[var(--bg-hover)] px-2 py-0.5 rounded uppercase tracking-wider mb-4 no-underline transition-colors"
            >
              {post.category}
            </Link>
          )}

          <h1 className="font-serif text-2xl sm:text-3xl md:text-[2.25rem] font-bold text-[var(--text)] leading-tight tracking-tight mb-5">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[var(--text-secondary)] pb-6 border-b border-[var(--border)] mb-8">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-[#37352f] dark:bg-[#e8e8e6] rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
                  <path d="M2 9l10 6 10-6" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
                </svg>
              </div>
              <span className="font-medium text-[var(--text)]">{post.author || 'Cleanmails'}</span>
            </div>
            <span className="text-[var(--border-strong)]">·</span>
            <span>{formatDate(post.date)}</span>
            <span className="text-[var(--border-strong)]">·</span>
            <span>{post.readTime}</span>
          </div>

          {post.excerpt && (
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed italic border-l-[3px] border-[var(--border)] pl-4 mb-8">
              {post.excerpt}
            </p>
          )}

          <ArticleContent html={post.htmlContent} />

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[var(--border)]">
              {post.tags.map(tag => (
                <span key={tag} className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--tag-bg)] px-2.5 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-5 border-t border-[var(--border)]">
            <Link href="/" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">
              ← Back to all posts
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-tertiary)]">Share</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://cleanmails.online/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-hover)] px-2.5 py-1 rounded no-underline transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://cleanmails.online/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-hover)] px-2.5 py-1 rounded no-underline transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <CTA />
        </article>

        {related.length > 0 && (
          <div className="container-wide pb-16">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Related</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map(p => <PostCard key={p.slug} post={p} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
