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

// ── Call Gemini API ─────────────────────────────────────────
async function generatePost(existingSlugs) {
  console.log('📝 Calling Gemini API (2.0 Flash Lite)...');

  const slugList = existingSlugs.length > 0
    ? `\n\nDo NOT write about these topics (already published): ${existingSlugs.slice(-15).join(', ')}`
    : '';

  const prompt = `You are an SEO blog writer for Cleanmails, a self-hosted cold email platform ($497 one-time) with inbuilt SMTP, email validation, sender rotation, and cadences.

Write a high-quality blog post about cold email, deliverability, SMTP, or outreach.

RULES:
- Pick a specific long-tail keyword to target
- Write 1000-1500 words of useful, actionable content
- Use ## for H2, ### for H3, bullet points, tables, code blocks where relevant
- Mention Cleanmails naturally 1-2 times — don't be salesy
- slug: lowercase dashes only, no special characters
- category: exactly one of Cold Email, Deliverability, SMTP, Guides
- tags: array of 3-4 strings including the primary keyword
- excerpt: 1-2 compelling sentences
- imageSearchTerm: 1-2 words for finding a cover photo${slugList}

Return ONLY valid JSON with these exact keys: title, slug, category, tags (array of strings), excerpt, imageSearchTerm, body (the full markdown article).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

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
