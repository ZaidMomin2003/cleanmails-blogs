'use client'

export default function ArticleContent({ html }: { html: string }) {
  const processed = html.replace(
    /<h([23])>(.*?)<\/h[23]>/gi,
    (_, level, text) => {
      const clean = text.replace(/<[^>]+>/g, '')
      const id = clean.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      return `<h${level} id="${id}">${text}</h${level}>`
    }
  )
  return <div className="prose" dangerouslySetInnerHTML={{ __html: processed }} />
}
