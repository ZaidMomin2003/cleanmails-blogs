import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-5 transition-colors">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">📭</p>
        <h1 className="font-serif text-xl font-bold text-[var(--text)] mb-2">Page not found</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          This post doesn't exist or may have been moved.
        </p>
        <Link
          href="/"
          className="text-[13px] font-medium text-[var(--text)] bg-[var(--bg-hover)] hover:bg-[var(--bg-secondary)] px-4 py-2 rounded no-underline transition-colors"
        >
          ← Back to blog
        </Link>
      </div>
    </div>
  )
}
