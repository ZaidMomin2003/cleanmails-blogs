/**
 * Blog Post Generator
 * Called by GitHub Actions on schedule (3x daily) or manually.
 * Uses Groq (Llama 3.3 70B) for writing + Pexels for cover images.
 */

import fs from 'fs';
import path from 'path';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// ── Validate env ────────────────────────────────────────────
if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is not set');
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

// ── Call Groq API ───────────────────────────────────────────
async function generatePost(existingSlugs) {
  console.log('📝 Calling Groq API (Llama 3.1 8B)...');

  const slugList = existingSlugs.length > 0
    ? `\n\nDo NOT write about these topics (already published): ${existingSlugs.slice(-15).join(', ')}`
    : '';

  const systemPrompt = `You are an SEO blog writer for Cleanmails, a self-hosted cold email platform ($497 one-time) with inbuilt SMTP, email validation, sender rotation, and cadences.

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
- imageSearchTerm: 1-2 words for finding a cover photo${slugList}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Write a new blog post. Return ONLY valid JSON with keys: title, slug, category, tags (array), excerpt, imageSearchTerm, body. The body must be the full markdown article.' },
      ],
      temperature: 0.8,
      max_tokens: 8192,
      response_format: {
        type: 'json_object',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Groq returned empty response');
  }

  console.log('✅ Groq response received');
  return JSON.parse(content);
}

// ── Fetch cover image from Pexels ───────────────────────────
async function fetchCoverImage(searchTerm) {
  console.log(`🖼️  Searching Pexels for: "${searchTerm}"...`);

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&orientation=landscape&per_page=5&size=large`;

  const response = await fetch(url, {
    headers: { 'Authorization': PEXELS_API_KEY },
  });

  if (!response.ok) {
    console.warn(`⚠️  Pexels API error (${response.status}). Using fallback.`);
    return null;
  }

  const data = await response.json();

  if (!data.photos || data.photos.length === 0) {
    console.warn('⚠️  No Pexels results. Using fallback.');
    return null;
  }

  // Pick a random photo from top 5 results for variety
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
  // Handle common field name variations from AI
  if (!post.body && post.content) post.body = post.content;
  if (!post.body && post.article) post.body = post.article;
  if (!post.body && post.markdown) post.body = post.markdown;
  if (!post.body && post.text) post.body = post.text;
  if (!post.body && post.blog_post) post.body = post.blog_post;
  if (!post.body && post.post_body) post.body = post.post_body;
  if (!post.imageSearchTerm && post.image_search_term) post.imageSearchTerm = post.image_search_term;
  if (!post.imageSearchTerm && post.search_term) post.imageSearchTerm = post.search_term;
  if (!post.imageSearchTerm && post.cover_image_search) post.imageSearchTerm = post.cover_image_search;

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

  if (!post.slug) {
    throw new Error('Slug is empty after sanitization');
  }

  // Validate category
  const validCategories = ['Cold Email', 'Deliverability', 'SMTP', 'Guides'];
  if (!validCategories.includes(post.category)) {
    // Try to match closest
    const lower = post.category.toLowerCase();
    const match = validCategories.find(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()));
    post.category = match || 'Guides';
  }

  // Ensure tags is an array
  if (!Array.isArray(post.tags)) {
    post.tags = typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : ['cold email'];
  }

  // Calculate read time from actual word count
  const wordCount = post.body.split(/\s+/).length;
  post.readTime = `${Math.ceil(wordCount / 200)} min read`;

  return post;
}

// ── Escape YAML string values ───────────────────────────────
function yamlEscape(str) {
  if (!str) return '""';
  // If string contains quotes, colons, or special chars, wrap in double quotes and escape inner quotes
  const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

// ── Build the markdown file ─────────────────────────────────
function buildMarkdown(post, image) {
  const today = new Date().toISOString().split('T')[0];
  const tagsYaml = `[${post.tags.map(t => yamlEscape(t)).join(', ')}]`;

  const frontmatter = `---
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

  return frontmatter;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting blog post generation...\n');

  try {
    // 1. Get existing slugs
    const existingSlugs = getExistingSlugs();
    console.log(`📂 Found ${existingSlugs.length} existing posts\n`);

    // 2. Generate post with AI
    const rawPost = await generatePost(existingSlugs);
    console.log(`   Title: ${rawPost.title}`);
    console.log(`   Slug: ${rawPost.slug}`);
    console.log(`   Category: ${rawPost.category}\n`);

    // 3. Validate
    const post = validate(rawPost);

    // 4. Check for duplicate slug
    if (existingSlugs.includes(post.slug)) {
      // Append a random suffix
      const suffix = Math.random().toString(36).slice(2, 6);
      post.slug = `${post.slug}-${suffix}`;
      console.log(`⚠️  Slug already exists. Using: ${post.slug}\n`);
    }

    // 5. Fetch cover image
    const searchTerm = rawPost.imageSearchTerm || rawPost.category || 'email marketing';
    const image = await fetchCoverImage(searchTerm);
    if (image) {
      console.log(`   Image: ${image.photographer} via Pexels\n`);
    }

    // 6. Build markdown
    const markdown = buildMarkdown(post, image);

    // 7. Write file
    const filePath = path.join(POSTS_DIR, `${post.slug}.md`);
    fs.writeFileSync(filePath, markdown, 'utf8');
    console.log(`✅ Created: content/posts/${post.slug}.md`);
    console.log(`   Words: ${post.body.split(/\s+/).length}`);
    console.log(`   Read time: ${post.readTime}`);
    console.log('\n🎉 Done! The GitHub Action will commit and push this file.');

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    process.exit(1);
  }
}

main();
