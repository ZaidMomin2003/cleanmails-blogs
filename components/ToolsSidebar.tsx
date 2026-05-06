'use client'

import { useState } from 'react'

const tools = [
  {
    icon: '🛡️',
    name: 'Spam Checker',
    description: 'Check your email for spam words',
    href: 'https://cleanmails.online/tools/spam-checker',
  },
  {
    icon: '🔍',
    name: 'DNS Checker',
    description: 'SPF, DKIM & DMARC lookup',
    href: 'https://cleanmails.online/tools/dns-checker',
  },
  {
    icon: '📧',
    name: 'Email Extractor',
    description: 'Extract emails from any text',
    href: 'https://cleanmails.online/tools/email-extractor',
  },
  {
    icon: '🧹',
    name: 'CSV Cleaner',
    description: 'Clean messy email lists',
    href: 'https://cleanmails.online/tools/csv-cleaner',
  },
]

export default function ToolsSidebar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* Desktop sidebar — fixed right edge */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Collapsed state — just icons */}
        <div
          className={`flex flex-col gap-1.5 transition-all duration-300 ${
            expanded ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'
          }`}
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border)] border-r-0 rounded-l-lg p-2 flex flex-col gap-2 shadow-sm">
            {tools.map(t => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] transition-colors no-underline text-lg"
                title={t.name}
              >
                {t.icon}
              </a>
            ))}
            <div className="w-full h-px bg-[var(--border)] my-0.5" />
            <div className="w-9 h-9 flex items-center justify-center text-[var(--text-tertiary)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M10 7H4M7 4l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded drawer */}
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            expanded
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
        >
          <div className="bg-[var(--card-bg)] border border-[var(--border)] border-r-0 rounded-l-xl p-4 shadow-lg w-[220px]">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              Free Tools
            </p>
            <div className="flex flex-col gap-1">
              {tools.map(t => (
                <a
                  key={t.name}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors no-underline group"
                >
                  <span className="text-lg flex-shrink-0">{t.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text)] group-hover:text-[var(--text)] truncate">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                      {t.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <a
                href="https://cleanmails.online/tools"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text)] no-underline transition-colors"
              >
                View all tools
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — bottom floating button */}
      <div className="fixed bottom-5 right-5 z-40 md:hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-12 h-12 bg-[var(--text)] text-[var(--bg)] rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
          aria-label="Free tools"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="2" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="11" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>

        {/* Mobile drawer */}
        {expanded && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setExpanded(false)} />
            <div className="absolute bottom-14 right-0 z-40 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 shadow-xl w-[200px] animate-[slideUp_0.2s_ease]">
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                Free Tools
              </p>
              {tools.map(t => (
                <a
                  key={t.name}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors no-underline"
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="text-[12px] font-medium text-[var(--text)]">{t.name}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
