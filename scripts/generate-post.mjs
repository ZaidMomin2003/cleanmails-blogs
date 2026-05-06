/**
 * Blog Post Generator
 * Called by GitHub Actions on schedule (3x daily) or manually.
 * Uses Google Gemini 2.0 Flash Lite for writing + Pexels for cover images.
 */

import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// ── Validate env ────────────────────────────────────────────
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set');
  process.exit(1);
}
if (!PEXELS_API_KEY) {
  console.error('❌ PEXELS_API_KEY is not set');
  process.exit(1);
}

// ── Get existing slugs to avoid duplicates ──────────────────
function getExistingSlugs() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    return [];
  }
  return fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

// ── Get existing keywords/titles to prevent cannibalization ──
function getExistingKeywords() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const keywords = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    // Extract title and tags from frontmatter
    const titleMatch = content.match(/^title:\s*"(.+)"/m);
    const tagsMatch = content.match(/^tags:\s*\[(.+)\]/m);
    if (titleMatch) keywords.push(titleMatch[1]);
    if (tagsMatch) {
      const tags = tagsMatch[1].replace(/"/g, '').split(',').map(t => t.trim());
      keywords.push(...tags);
    }
  }
  return [...new Set(keywords)];
}

// ── Get existing slugs for internal linking ─────────────────
function getExistingPostsForLinking() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const titleMatch = content.match(/^title:\s*"(.+)"/m);
    const slugMatch = content.match(/^slug:\s*"(.+)"/m);
    const categoryMatch = content.match(/^category:\s*"(.+)"/m);
    if (titleMatch && slugMatch) {
      posts.push({
        title: titleMatch[1],
        slug: slugMatch[1],
        category: categoryMatch ? categoryMatch[1] : 'Guides',
      });
    }
  }
  return posts;
}

// ── Call Gemini API ─────────────────────────────────────────
async function generatePost(existingSlugs) {
  console.log('📝 Calling Gemini API (3.1 Flash Lite)...');

  const existingKeywords = getExistingKeywords();
  const existingPosts = getExistingPostsForLinking();

  const slugList = existingSlugs.length > 0
    ? `\n\nDo NOT write about these topics (already published): ${existingSlugs.slice(-20).join(', ')}`
    : '';

  const keywordList = existingKeywords.length > 0
    ? `\n\nDo NOT target these keywords (already used — would cause cannibalization): ${existingKeywords.slice(-40).join(', ')}`
    : '';

  const linkingContext = existingPosts.length > 0
    ? `\n\nFor internal linking, naturally include 2-3 links to these existing posts where relevant (use markdown links with /blog/slug format):
${existingPosts.slice(-15).map(p => `- "${p.title}" → /blog/${p.slug}`).join('\n')}

Also link to these free tools where relevant:
- SPF/DKIM/DMARC Checker → /tools/dns-checker
- Email Spam Word Checker → /tools/spam-checker
- Email Extractor → /tools/email-extractor
- CSV Email List Cleaner → /tools/csv-cleaner`
    : '';

  const prompt = `You are an SEO blog writer for Cleanmails, a self-hosted cold email platform ($497 one-time) with inbuilt SMTP, email validation, sender rotation, and cadences.

Write a high-quality blog post about cold email, deliverability, SMTP, or outreach.

RULES:
- Pick a specific long-tail keyword to target that is DIFFERENT from all previously used keywords
- Write 1200-1800 words of useful, actionable content
- Use ## for H2, ### for H3, bullet points, tables, code blocks where relevant
- Mention Cleanmails naturally 1-2 times — don't be salesy
- Include 2-3 internal links to other blog posts and/or tools (use relative URLs like /blog/slug-here or /tools/tool-name)
- End the article with a "Related:" section linking to 2-3 related posts and 1 tool
- slug: lowercase dashes only, no special characters
- category: exactly one of Cold Email, Deliverability, SMTP, Guides
- tags: array of 3-4 strings including the primary keyword (must be UNIQUE — not used before)
- excerpt: 1-2 compelling sentences
- imageSearchTerm: 1-2 words for finding a cover photo
- targetKeyword: the specific long-tail SEO keyword this post targets (for tracking)${slugList}${keywordList}${linkingContext}

Return ONLY valid JSON with these exact keys: title, slug, category, tags (array of strings), excerpt, imageSearchTerm, targetKeyword, body (the full markdown article including internal links).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: prompt }] }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();

  // Gemini response structure: candidates[0].content.parts[0].text
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini returned empty response: ' + JSON.stringify(data));
  }

  console.log('✅ Gemini response received');

  // Parse JSON — Gemini sometimes wraps in ```json blocks
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(cleaned);
}

// ── Fetch cover image from Pexels ───────────────────────────
async function fetchCoverImage(searchTerm) {
  console.log(`🖼️  Searching Pexels for: "${searchTerm}"...`);

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&orientation=landscape&per_page=5&size=large`;

  const response = await fetch(url, {
    headers: { 'Authorization': PEXELS_API_KEY },
  });

  if (!response.ok) {
    console.warn(`⚠️  Pexels API error (${response.status}). Skipping cover image.`);
    return null;
  }

  const data = await response.json();

  if (!data.photos || data.photos.length === 0) {
    console.warn('⚠️  No Pexels results. Skipping cover image.');
    return null;
  }

  const photo = data.photos[Math.floor(Math.random() * data.photos.length)];

  return {
    url: photo.src.large2x || photo.src.large || photo.src.original,
    alt: photo.alt || searchTerm,
    photographer: photo.photographer || 'Pexels',
    photographerUrl: photo.photographer_url || 'https://www.pexels.com',
  };
}

// ── Validate and sanitize the AI output ─────────────────────
function validate(post) {
  // Handle common field name variations
  if (!post.body && post.content) post.body = post.content;
  if (!post.body && post.article) post.body = post.article;
  if (!post.body && post.markdown) post.body = post.markdown;
  if (!post.body && post.text) post.body = post.text;
  if (!post.body && post.blog_post) post.body = post.blog_post;
  if (!post.body && post.post_body) post.body = post.post_body;
  if (!post.imageSearchTerm && post.image_search_term) post.imageSearchTerm = post.image_search_term;
  if (!post.imageSearchTerm && post.search_term) post.imageSearchTerm = post.search_term;

  const required = ['title', 'slug', 'category', 'tags', 'excerpt', 'body'];
  for (const field of required) {
    if (!post[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Sanitize slug
  post.slug = post.slug
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  if (!post.slug) throw new Error('Slug is empty after sanitization');

  // Validate category
  const validCategories = ['Cold Email', 'Deliverability', 'SMTP', 'Guides'];
  if (!validCategories.includes(post.category)) {
    const lower = post.category.toLowerCase();
    const match = validCategories.find(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()));
    post.category = match || 'Guides';
  }

  // Ensure tags is an array
  if (!Array.isArray(post.tags)) {
    post.tags = typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : ['cold email'];
  }

  // Calculate read time
  const wordCount = post.body.split(/\s+/).length;
  post.readTime = `${Math.ceil(wordCount / 200)} min read`;

  return post;
}

// ── Escape YAML string values ───────────────────────────────
function yamlEscape(str) {
  if (!str) return '""';
  const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

// ── Build the markdown file ─────────────────────────────────
function buildMarkdown(post, image) {
  const today = new Date().toISOString().split('T')[0];
  const tagsYaml = `[${post.tags.map(t => yamlEscape(t)).join(', ')}]`;

  return `---
title: ${yamlEscape(post.title)}
slug: ${yamlEscape(post.slug)}
date: "${today}"
author: "Cleanmails"
tags: ${tagsYaml}
category: ${yamlEscape(post.category)}
coverImage: "${image ? image.url : ''}"
coverImageAlt: ${yamlEscape(image ? image.alt : post.title)}
excerpt: ${yamlEscape(post.excerpt)}
readTime: "${post.readTime}"
photographerName: "${image ? image.photographer : ''}"
photographerUrl: "${image ? image.photographerUrl : ''}"
---

${post.body}`;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting blog post generation...\n');

  try {
    const existingSlugs = getExistingSlugs();
    console.log(`📂 Found ${existingSlugs.length} existing posts\n`);

    const rawPost = await generatePost(existingSlugs);
    console.log(`   Title: ${rawPost.title}`);
    console.log(`   Slug: ${rawPost.slug}`);
    console.log(`   Category: ${rawPost.category}\n`);

    const post = validate(rawPost);

    if (existingSlugs.includes(post.slug)) {
      const suffix = Math.random().toString(36).slice(2, 6);
      post.slug = `${post.slug}-${suffix}`;
      console.log(`⚠️  Slug exists. Using: ${post.slug}\n`);
    }

    const searchTerm = rawPost.imageSearchTerm || rawPost.category || 'email marketing';
    const image = await fetchCoverImage(searchTerm);
    if (image) console.log(`   Image: ${image.photographer} via Pexels\n`);

    const markdown = buildMarkdown(post, image);
    const filePath = path.join(POSTS_DIR, `${post.slug}.md`);
    fs.writeFileSync(filePath, markdown, 'utf8');

    console.log(`✅ Created: content/posts/${post.slug}.md`);
    console.log(`   Words: ${post.body.split(/\s+/).length}`);
    console.log(`   Read time: ${post.readTime}`);
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    process.exit(1);
  }
}

main();
