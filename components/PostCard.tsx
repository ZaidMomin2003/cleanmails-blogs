'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PostMeta, formatDate } from '@/lib/types'

export default function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  if (featured) {
    return (
      <Link href={`/${post.slug}`} className="block group no-underline">
        <article className="flex flex-col md:flex-row border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] transition-colors">
          {post.coverImage && (
            <div className="relative w-full md:w-1/2 aspect-[16/10] flex-shrink-0">
              <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
            </div>
          )}
          <div className="p-5 sm:p-7 flex flex-col justify-between flex-1">
            <div>
              {post.category && (
                <span className="inline-block text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--tag-bg)] px-2 py-0.5 rounded uppercase tracking-wider mb-3">
                  {post.category}
                </span>
              )}
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text)] leading-snug tracking-tight mb-2 group-hover:underline group-hover:decoration-[var(--border-strong)] group-hover:underline-offset-4">
                {post.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">{post.excerpt}</p>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-tertiary)]">
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/${post.slug}`} className="block group no-underline">
      <article className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] transition-colors h-full flex flex-col">
        {post.coverImage && (
          <div className="relative aspect-[16/9] flex-shrink-0">
            <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          </div>
        )}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {post.category && (
            <span className="inline-block text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--tag-bg)] px-2 py-0.5 rounded uppercase tracking-wider mb-2 w-fit">
              {post.category}
            </span>
          )}
          <h3 className="font-serif text-base font-bold text-[var(--text)] leading-snug tracking-tight mb-1.5 line-clamp-2 group-hover:underline group-hover:decoration-[var(--border-strong)] group-hover:underline-offset-2">
            {post.title}
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 flex-1 mb-3">{post.excerpt}</p>
          <div className="flex items-center gap-1.5 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-tertiary)]">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
