import { getAllPosts, getAllCategories } from '@/lib/posts'
import ThemeToggle from '@/components/ThemeToggle'
import BlogContent from '@/components/BlogContent'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { category: active } = await searchParams
  const allPosts = getAllPosts()
  const categories = getAllCategories()

  const filtered = active
    ? allPosts.filter(p => p.category?.toLowerCase() === active.toLowerCase())
    : allPosts

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors">
      {/* ── Sticky nav ───────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)]">
        <div className="container-wide flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-[#37352f] dark:bg-[#e8e8e6] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
                <path d="M2 9l10 6 10-6" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
              </svg>
            </div>
            <div>
              <span className="text-[14px] font-semibold text-[var(--text)]">Cleanmails</span>
              <span className="text-[14px] text-[var(--text-tertiary)] ml-1.5">/</span>
              <span className="text-[14px] text-[var(--text-tertiary)] ml-1.5">Blog</span>
            </div>
          </Link>
          <div className="flex items-center gap-2.5">
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

      {/* ── Page header ──────────────────────────────────── */}
      <div className="container-wide pt-10 sm:pt-14">
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight leading-tight mb-2">
            Blog
          </h1>
          <p className="text-sm sm:text-[15px] text-[var(--text-secondary)] max-w-lg leading-relaxed">
            Cold email deliverability, SMTP setup, email validation, and outreach strategy.
          </p>
        </div>
      </div>

      {/* ── Search + Posts + Pagination ───────────────────── */}
      <div className="container-wide pb-16">
        <BlogContent
          posts={filtered}
          categories={categories}
          activeCategory={active}
        />
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] mt-8 transition-colors">
        <div className="container-wide py-12 sm:py-16">
          <div className="bg-[var(--cta-card-bg)] rounded-xl p-8 sm:p-10 text-center transition-colors">
            <p className="text-[11px] font-semibold text-[#FFD700] uppercase tracking-widest mb-3">Stop paying monthly</p>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--cta-card-text)] leading-snug mb-3 max-w-md mx-auto">
              Own your cold email infrastructure.
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto leading-relaxed">
              Unlimited senders, email validation, cadences, and SMTP — one-time payment of $497.
            </p>
            <a href="https://cleanmails.online" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#37352f] bg-[#FFD700] hover:bg-[#f0cc00] px-6 py-2.5 rounded-lg transition-colors no-underline">
              Get Cleanmails
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
        </div>
        <div className="border-t border-[var(--border)]">
          <div className="container-wide py-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8 mb-8">
              <div className="max-w-xs">
                <a href="https://cleanmails.online" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 no-underline mb-3">
                  <div className="w-7 h-7 bg-[#37352f] dark:bg-[#e8e8e6] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="3" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
                      <path d="M2 9l10 6 10-6" className="stroke-[#FFD700] dark:stroke-[#37352f]" strokeWidth="2.5"/>
                    </svg>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--text)]">Cleanmails</span>
                </a>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Self-hosted cold email infrastructure. Inbuilt SMTP, unlimited sender rotation, email validation, and cadences.
                </p>
              </div>
              <div className="flex gap-12 sm:gap-16 flex-wrap">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Blog</p>
                  <div className="flex flex-col gap-2">
                    <Link href="/" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">All posts</Link>
                    <Link href="/?category=Cold+Email" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">Cold Email</Link>
                    <Link href="/?category=Deliverability" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">Deliverability</Link>
                    <Link href="/?category=SMTP" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">SMTP</Link>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Product</p>
                  <div className="flex flex-col gap-2">
                    <a href="https://cleanmails.online/#features" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">Features</a>
                    <a href="https://cleanmails.online/#pricing" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">Pricing</a>
                    <a href="https://cleanmails.online/docs.html" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">Docs</a>
                    <a href="https://cleanmails.online/support.html" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors">Support</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[12px] text-[var(--text-tertiary)]">© {new Date().getFullYear()} Cleanmails. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="https://cleanmails.online/privacy.html" className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text)] no-underline transition-colors">Privacy</a>
                <a href="https://cleanmails.online/terms.html" className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text)] no-underline transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
