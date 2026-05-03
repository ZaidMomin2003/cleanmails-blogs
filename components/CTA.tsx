export default function CTA() {
  return (
    <section className="mt-16 mb-12 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] p-6 sm:p-8 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold text-[var(--text)] mb-1">
            Stop paying monthly for cold email.
          </p>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Cleanmails — self-hosted, unlimited everything, $497 one-time.
          </p>
        </div>
        <a
          href="https://cleanmails.online"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#37352f] bg-[#FFD700] hover:bg-[#f0cc00] px-5 py-2.5 rounded-md transition-colors whitespace-nowrap"
        >
          Get Cleanmails
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
      </div>
    </section>
  )
}
