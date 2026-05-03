# Cleanmails Blog — Project Reference

This file contains all design, brand, and technical context needed to build the blog site at `cleanmails.online/blog`.

---

## Project Overview

- **What:** A standalone Next.js blog site for Cleanmails (a self-hosted cold email SaaS)
- **URL:** `cleanmails.online/blog` (served via reverse proxy from main site's `vercel.json`)
- **Hosted:** Separate Vercel project, separate GitHub repo
- **Content pipeline:** n8n writes blog posts as Markdown files → pushes to GitHub → Vercel auto-deploys
- **Images:** Unsplash API (n8n fetches cover image URL per post, embeds in frontmatter)
- **Main site:** `cleanmails.online` (vanilla HTML/CSS/JS, hosted on Vercel)

---

## Reverse Proxy Setup (Option B)

The blog lives at its own Vercel deployment but is accessible at `cleanmails.online/blog` via a rewrite rule added to the main site's `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/blog/:path*", "destination": "https://cleanmails-blog.vercel.app/blog/:path*" }
  ]
}
```

Users always see `cleanmails.online/blog` in their browser. The two deployments are fully independent — a broken blog deploy cannot affect the main site.

---

## Brand & Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--black` | `#000000` | Text, borders, shadows |
| `--white` | `#FFFFFF` | Card backgrounds |
| `--off-white` | `#FAFAFA` | Page background |
| `--gold` | `#FFD700` | Badges, highlights, CTA shadows, section labels |
| `--muted` | `#666666` | Secondary text, captions |
| `--text` | `#1A1A1A` | Primary body text |
| `--red` | `#e63946` | Warnings, urgency elements (use sparingly on blog) |
| `--green` | `#2ecc71` | Positive indicators (use sparingly on blog) |

> The blog should use **black, white, off-white, and gold only**. Red and green are for the main marketing site's urgency/pricing sections — avoid on the blog for a cleaner editorial feel.

### Typography

- **Font family:** Inter (Google Fonts) — `https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap`
- **Heading weight:** 800–900
- **Heading letter-spacing:** `-0.03em` to `-0.04em`
- **Heading line-height:** `1.08–1.1`
- **Body weight:** 500–600
- **Body line-height:** `1.6–1.7`
- **Section labels / tags:** uppercase, `letter-spacing: 0.12em`, weight 900, small pill shape
- **Font sizes:** Use `clamp()` for responsive headings, e.g. `clamp(2.2rem, 5vw, 3.5rem)`

> Consider adding a serif font (e.g. **Playfair Display** or **Lora**) for blog post headings only, to give an editorial/magazine feel while keeping Inter for UI and body text.

### Borders & Shadows (Signature Look)

- **Border style:** `3px solid #000` — bold black borders on all cards, buttons, inputs
- **Shadow style:** Hard offset (neumorphic), NOT blurred
  - Standard: `6px 6px 0 #000`
  - Large: `10px 10px 0 #000`
  - Gold shadow (CTAs): `4px 4px 0 #FFD700`
  - Hover: shadow grows + element translates `-2px -2px` to `-4px -4px`
- **Border radius:**
  - Standard elements: `24px`
  - Large cards: `32px–40px`
  - Pills/badges: `100px`
  - Buttons: `12px–14px`
  - Small tags: `8px`

### Hover & Transition Patterns

```css
transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
/* On hover: */
transform: translate(-3px, -3px);
box-shadow: 8px 8px 0 #000; /* or gold variant */
```

### UI Component Patterns

- **Section labels:** Gold pill badge above section headings
  ```css
  background: #FFD700; border: 2px solid #000; border-radius: 100px;
  font-size: 0.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em;
  padding: 6px 16px;
  ```
- **Buttons (primary):** Black background, white text, gold shadow
  ```css
  background: #000; color: #fff; border: 2px solid #000;
  box-shadow: 4px 4px 0 #FFD700; border-radius: 12px;
  font-weight: 900;
  ```
- **Buttons (secondary):** Transparent, black border
- **Cards:** White background, `3px solid #000` border, hard shadow, `24px` radius
- **Section rhythm:** Alternate between `#FAFAFA` and `#000` (dark) sections for visual contrast
- **Max content width:** `1100px` centered with `margin: 0 auto`
- **Section padding:** `100px 24px`

---

## Blog-Specific Design Decisions

### Layout Pages Needed

1. **`/blog`** — Blog index: grid of post cards (cover image, title, date, tag, read time)
2. **`/blog/[slug]`** — Individual post: full article with cover image, MDX content, author, date, tags
3. **Shared layout** — Navbar (matching main site style) + Footer

### Post Card Design
- Cover image (from Unsplash) with `3px solid #000` border and hard shadow
- Gold tag/category pill
- Post title in Inter 800
- Date + read time in muted text
- Hover: card lifts with `translate(-3px, -3px)` + shadow grows

### Article Page Design
- Full-width cover image at top (with border + shadow)
- Title in large Inter 900 (or serif for editorial feel)
- Meta row: date, author (Cleanmails), read time, tags
- Body text: Inter 500, `1.1rem`, `line-height: 1.75`
- Code blocks: black background, white text, monospace font, gold shadow
- Blockquotes: left border `4px solid #FFD700`, gold accent
- H2/H3 in article: Inter 800, tight letter-spacing
- Back to blog link at top

### Navigation (Blog Header)
- Fixed/sticky, `border-bottom: 3px solid #000`
- Logo: Cleanmails logo + wordmark (link back to `cleanmails.online`)
- Nav links: "Blog" active state, link back to main site
- CTA button: "Get Cleanmails" → `cleanmails.online` (gold shadow button)
- Shrinks/hides on scroll down, reappears on scroll up (same as main site)
- Background: `rgba(250,250,250,0.95)` with `backdrop-filter: blur(12px)`

---

## Content Structure (Markdown Frontmatter)

n8n should generate each blog post as a `.md` or `.mdx` file with this frontmatter:

```yaml
---
title: "Your Blog Post Title Here"
slug: "your-blog-post-slug"
date: "2026-05-01"
author: "Cleanmails"
tags: ["cold email", "email deliverability"]
category: "Cold Email"
coverImage: "https://images.unsplash.com/photo-XXXXXXX?w=1200&q=80"
coverImageAlt: "Description of the image"
excerpt: "A short 1-2 sentence summary shown on the blog index card."
readTime: "5 min read"
---

Your blog post content here in Markdown...
```

Posts live in: `/content/posts/[slug].md`

---

## Tech Stack (Blog Project)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14** (App Router) | SSG, file-based routing, Vercel-native |
| Styling | **Tailwind CSS** | Fast to enforce design system, utility-first |
| Content | **Markdown files** in `/content/posts/` | Simple, n8n can write and push directly |
| MD parsing | **gray-matter** | Frontmatter parsing |
| MD rendering | **next-mdx-remote** or **remark/rehype** | Render Markdown as React |
| Images | **Unsplash API** (URL in frontmatter) + `next/image` | Free, high quality, auto-optimized |
| Fonts | **Google Fonts** (Inter) via `next/font` | Matches main site |
| Deployment | **Vercel** | Auto-deploy on GitHub push |

---

## n8n Content Pipeline

1. n8n workflow triggers (scheduled or manual)
2. Generates blog post content (title, body, tags, category, excerpt)
3. Calls **Unsplash API** with a search term related to the post topic → gets image URL
4. Assembles the `.md` file with frontmatter
5. Commits and pushes to the blog GitHub repo (`/content/posts/[slug].md`)
6. Vercel detects the push → rebuilds the site → new post is live

**Unsplash API endpoint n8n uses:**
```
GET https://api.unsplash.com/search/photos?query={TOPIC}&per_page=1&orientation=landscape
Authorization: Client-ID {UNSPLASH_ACCESS_KEY}
```
Pick `results[0].urls.regular` as the cover image URL.

**Attribution note:** Unsplash requires crediting the photographer. Store `results[0].user.name` and `results[0].links.html` in frontmatter and display in the post.

---

## File/Folder Structure (Blog Repo)

```
cleanmails-blog/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Redirects to /blog
│   ├── blog/
│   │   ├── page.tsx            # Blog index — lists all posts
│   │   └── [slug]/
│   │       └── page.tsx        # Individual post page
├── components/
│   ├── Navbar.tsx              # Fixed nav matching main site style
│   ├── Footer.tsx              # Footer with links back to cleanmails.online
│   ├── PostCard.tsx            # Card used on blog index
│   └── MDXContent.tsx          # Renders parsed markdown
├── content/
│   └── posts/                  # All .md blog post files live here
│       └── example-post.md
├── lib/
│   └── posts.ts                # Utility: read, parse, sort posts
├── public/
│   └── logo.svg                # Cleanmails logo (copy from main site)
├── styles/
│   └── globals.css             # Tailwind base + custom CSS variables
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## SEO Considerations

- Each post page should have unique `<title>`, `<meta description>`, Open Graph tags
- Use Next.js `generateMetadata()` per post from frontmatter
- Add `sitemap.xml` generation (next-sitemap or built-in Next.js sitemap)
- Canonical URLs: `https://cleanmails.online/blog/[slug]`
- Schema.org `BlogPosting` structured data per post

---

## Branding & Voice

- **Product name:** Cleanmails
- **Tagline:** Self-hosted cold email infrastructure
- **Audience:** Cold email marketers, agency owners, SaaS founders, developers
- **Tone:** Direct, confident, no fluff — same as the main site copy
- **Topics to cover:** Cold email deliverability, SMTP setup, email validation, sender rotation, cadences, Instantly/Smartlead alternatives, cold email tips

---

## Links & References

- Main site: `https://cleanmails.online`
- Logo: `/logo.svg` (envelope + checkmark icon)
- Google Analytics ID: `G-QWXBBLS661` (add to blog too)
- Main site GitHub: in the gumroad workspace folder
- Unsplash docs: `https://unsplash.com/documentation`
