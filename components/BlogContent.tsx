'use client'

import { useState } from 'react'
import Link from 'next/link'
import PostCard from './PostCard'
import { PostMeta } from '@/lib/types'

const POSTS_PER_PAGE = 9

export default function BlogContent({
  posts,
  categories,
  activeCategory,
}: {
  posts: PostMeta[]
  categories: string[]
  activeCategory?: string
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Filter by search
  const searched = search.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : posts

  // Pagination
  const totalPages = Math.ceil(searched.length / POSTS_PER_PAGE)
  const paginated = searched.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  // Featured post (only on first page, no search, no category filter)
  const showFeatured = page === 1 && !search.trim() && !activeCategory
  const featured = showFeatured ? paginated[0] : null
  const gridPosts = featured ? paginated.slice(1) : paginated

  return (
    <>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          >
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        {search && (
          <p className="text-[12px] text-[var(--text-tertiary)] mt-2">
            {searched.length} result{searched.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 flex-wrap mb-6">
        <Link
          href="/"
          className={`text-[13px] font-medium px-3 py-1 rounded no-underline transition-colors ${
            !activeCategory
              ? 'bg-[var(--text)] text-[var(--bg)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
          }`}
        >
          All
        </Link>
        {categories.map(cat => (
          <Link
            key={cat}
            href={`/?category=${encodeURIComponent(cat)}`}
            className={`text-[13px] font-medium px-3 py-1 rounded no-underline transition-colors ${
              activeCategory?.toLowerCase() === cat.toLowerCase()
                ? 'bg-[var(--text)] text-[var(--bg)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <hr className="border-[var(--border)] mb-8" />

      {/* Posts */}
      {searched.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {search ? `No posts matching "${search}"` : 'No posts in this category yet.'}
          </p>
          {(search || activeCategory) && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="text-sm text-[var(--text)] underline underline-offset-2 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <div className="mb-8">
              <PostCard post={featured} featured />
            </div>
          )}

          {/* Grid */}
          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gridPosts.map(post => <PostCard key={post.slug} post={post} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-[var(--text-tertiary)] px-1">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`text-[13px] font-medium w-8 h-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        p === page
                          ? 'bg-[var(--text)] text-[var(--bg)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}

          {/* Page info */}
          {totalPages > 1 && (
            <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-3">
              Page {page} of {totalPages} · {searched.length} posts
            </p>
          )}
        </>
      )}
    </>
  )
}
