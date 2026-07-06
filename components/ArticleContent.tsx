'use client'

const PROMO_HTML = `
<div style="margin:2.5em 0;padding:28px 24px;background:var(--bg-secondary);border:2px solid var(--border);border-radius:12px;text-align:center;">
  <p style="font-size:0.7rem;font-weight:700;color:#FFD700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Stop paying monthly</p>
  <p style="font-size:1.15rem;font-weight:700;color:var(--text);margin:0 0 16px;line-height:1.4;">Cleanmails — self-hosted cold email infrastructure.</p>
  <div style="display:flex;flex-direction:column;gap:6px;max-width:340px;margin:0 auto 18px;text-align:left;">
    <span style="font-size:0.85rem;color:var(--text-secondary);display:flex;align-items:center;gap:8px;">✓ <strong style="color:var(--text);">Unlimited sender rotation</strong> — no per-inbox fees</span>
    <span style="font-size:0.85rem;color:var(--text-secondary);display:flex;align-items:center;gap:8px;">✓ <strong style="color:var(--text);">Inbuilt email validation</strong> — 135K+ disposable domains</span>
    <span style="font-size:0.85rem;color:var(--text-secondary);display:flex;align-items:center;gap:8px;">✓ <strong style="color:var(--text);">AI auto-reply</strong> — BYO API key, ~$0.001/reply</span>
  </div>
  <a href="https://cleanmails.online" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#37352f;color:#fff;font-size:0.82rem;font-weight:700;padding:10px 22px;border-radius:8px;text-decoration:none;transition:opacity 0.2s;">One-time $199 — Get Cleanmails →</a>
</div>
`

export default function ArticleContent({ html }: { html: string }) {
  // Add IDs to headings for anchor links
  const processed = html.replace(
    /<h([23])>(.*?)<\/h[23]>/gi,
    (_, level, text) => {
      const clean = text.replace(/<[^>]+>/g, '')
      const id = clean.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      return `<h${level} id="${id}">${text}</h${level}>`
    }
  )

  // Inject promo card after the 3rd <h2> tag
  const h2Regex = /<h2[^>]*>/gi
  let match
  let h2Count = 0
  let insertIndex = -1

  while ((match = h2Regex.exec(processed)) !== null) {
    h2Count++
    if (h2Count === 3) {
      // Insert before the 3rd h2
      insertIndex = match.index
      break
    }
  }

  // If fewer than 3 h2s, insert roughly in the middle
  if (insertIndex === -1) {
    insertIndex = Math.floor(processed.length / 2)
    // Find the nearest closing tag to avoid splitting mid-tag
    const nearestClose = processed.indexOf('>', insertIndex)
    if (nearestClose !== -1) insertIndex = nearestClose + 1
  }

  const withPromo = processed.slice(0, insertIndex) + PROMO_HTML + processed.slice(insertIndex)

  return <div className="prose" dangerouslySetInnerHTML={{ __html: withPromo }} />
}
