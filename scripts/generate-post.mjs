/**
 * Blog Post Generator (Queue-Based + AWS Bedrock Claude Sonnet 4.6)
 * Called by GitHub Actions on schedule (3x daily) or manually.
 * Reads next pending title from blog-queue.json, writes the post via Claude, marks as done.
 */

import fs from 'fs';
import path from 'path';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const QUEUE_FILE = path.join(process.cwd(), 'scripts', 'blog-queue.json');

// Claude Sonnet 4.6 on Bedrock (cross-region for better availability)
const MODEL_ID = 'us.anthropic.claude-sonnet-4-6';

// ── Valid categories ────────────────────────────────────────
const VALID_CATEGORIES = [
  'Cold Email', 'Deliverability', 'SMTP', 'Guides',
  'Infrastructure', 'Agency', 'Comparisons', 'Lead Generation', 'Automation'
];

// ── Validate env ────────────────────────────────────────────
if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE) {
  console.error('❌ AWS credentials not configured (need AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY or AWS_PROFILE)');
  process.exit(1);
}
if (!PEXELS_API_KEY) {
  console.error('❌ PEXELS_API_KEY is not set');
  process.exit(1);
}

// ── Initialize Bedrock client ───────────────────────────────
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

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

// ── Get existing posts for internal linking ─────────────────
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

// ── Queue management ────────────────────────────────────────
function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    console.error('❌ Queue file not found:', QUEUE_FILE);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf8');
}

function getNextPendingItem(queue) {
  return queue.find(item => item.status === 'pending');
}

// ── Call Claude Sonnet 4.6 via Bedrock Converse API ─────────
async function generatePost(queueItem) {
  console.log('📝 Calling Claude Sonnet 4.6 via AWS Bedrock...');
  console.log(`   Topic: "${queueItem.title}"`);
  console.log(`   Keyword: "${queueItem.targetKeyword}"`);
  console.log(`   Category: "${queueItem.category}"`);

  const existingPosts = getExistingPostsForLinking();

  const linkingContext = existingPosts.length > 0
    ? `\n\nFor internal linking, naturally include 2-3 links to these existing posts where relevant (use markdown links with /blog/slug format):
${existingPosts.slice(-15).map(p => `- "${p.title}" → /blog/${p.slug}`).join('\n')}

Also link to these free tools where relevant:
- Bulk Email Verifier → /tools/email-verifier
- SPF/DKIM/DMARC Checker → /tools/dns-checker
- Email Spam Word Checker → /tools/spam-checker
- Email Extractor → /tools/email-extractor
- CSV Email List Cleaner → /tools/csv-cleaner`
    : '';

  const systemPrompt = `You are an expert SEO blog writer for Cleanmails, a self-hosted cold email platform ($497 one-time) with inbuilt SMTP, email validation, sender rotation, and cadences. You write like a senior cold email practitioner — direct, opinionated, data-driven. Never generic. Always actionable.`;

  const userPrompt = `Write a blog post with this EXACT title: "${queueItem.title}"
Target this SEO keyword: "${queueItem.targetKeyword}"
Category: "${queueItem.category}"

WRITING RULES:
- Write 1400-2000 words of genuinely useful, actionable content
- Write in first person where the title implies it (e.g., "I sent...", "I tested...")
- Use specific numbers, data points, and examples — not generic advice
- Include real-world scenarios and practical steps readers can follow today
- Use ## for H2, ### for H3, bullet points, numbered lists, tables, and code blocks where relevant
- Make it feel like a senior cold email practitioner wrote this, not a generic AI
- Include contrarian takes or surprising insights that make people want to share it
- Mention Cleanmails naturally 1-2 times as a solution — never salesy, always contextual
- Include 2-3 internal links to other blog posts and/or tools (use relative URLs like /blog/slug-here or /tools/tool-name)
- End with a "Related:" section linking to 2-3 related posts and 1 tool
- The content should be so good that someone would bookmark it or share it on Reddit/Twitter

VIRAL ELEMENTS TO INCLUDE:
- A hook in the first 2 sentences that creates curiosity or tension
- At least one surprising statistic or counterintuitive insight
- Actionable takeaways someone can implement in under 30 minutes
- A clear opinion or stance (not wishy-washy "it depends" content)

SEO RULES:
- Use the target keyword naturally in the first paragraph
- Include the keyword in at least one H2 heading
- Use related long-tail variations throughout the body
- Write a compelling excerpt (1-2 sentences) that would make someone click from Google

OUTPUT FORMAT — Return ONLY valid JSON with these exact keys:
{
  "slug": "lowercase-dashes-max-60-chars",
  "tags": ["tag1", "tag2", "tag3"],
  "excerpt": "1-2 compelling sentences for meta description",
  "imageSearchTerm": "1-2 words for cover photo",
  "body": "the full markdown article including internal links"
}

Do NOT include the title in the body — it will be added from the queue.${linkingContext}`;

  const command = new ConverseCommand({
    modelId: MODEL_ID,
    system: [{ text: systemPrompt }],
    messages: [
      {
        role: 'user',
        content: [{ text: userPrompt }],
      },
    ],
    inferenceConfig: {
      maxTokens: 8192,
      temperature: 0.85,
    },
  });

  const response = await bedrockClient.send(command);

  // Extract text from Converse API response
  const outputMessage = response.output?.message;
  if (!outputMessage || !outputMessage.content || outputMessage.content.length === 0) {
    throw new Error('Bedrock returned empty response');
  }

  const text = outputMessage.content[0].text;
  if (!text) {
    throw new Error('Bedrock response has no text content');
  }

  console.log('✅ Claude response received');
  console.log(`   Tokens — Input: ${response.usage?.inputTokens}, Output: ${response.usage?.outputTokens}`);

  // Parse JSON — Claude sometimes wraps in ```json blocks
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

// ── Validate and sanitize ───────────────────────────────────
function validate(post, queueItem) {
  // Handle common field name variations
  if (!post.body && post.content) post.body = post.content;
  if (!post.body && post.article) post.body = post.article;
  if (!post.body && post.markdown) post.body = post.markdown;
  if (!post.imageSearchTerm && post.image_search_term) post.imageSearchTerm = post.image_search_term;

  if (!post.body) throw new Error('Missing body content');
  if (!post.slug) throw new Error('Missing slug');

  // Sanitize slug
  post.slug = post.slug
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  if (!post.slug) throw new Error('Slug is empty after sanitization');

  // Use queue item's category
  post.category = queueItem.category;
  if (!VALID_CATEGORIES.includes(post.category)) {
    post.category = 'Guides';
  }

  // Use queue item's title
  post.title = queueItem.title;

  // Ensure tags is an array
  if (!Array.isArray(post.tags)) {
    post.tags = typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : [queueItem.targetKeyword];
  }

  // Ensure excerpt exists
  if (!post.excerpt) {
    post.excerpt = queueItem.title;
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
  console.log('🚀 Starting blog post generation (Claude Sonnet 4.6 via Bedrock)...\n');

  try {
    // Load queue and find next pending item
    const queue = loadQueue();
    const pendingCount = queue.filter(i => i.status === 'pending').length;
    const doneCount = queue.filter(i => i.status === 'done').length;
    console.log(`📋 Queue: ${pendingCount} pending, ${doneCount} done, ${queue.length} total\n`);

    const queueItem = getNextPendingItem(queue);

    if (!queueItem) {
      console.log('✅ All queue items are done! No new post to generate.');
      console.log('   Add more items to scripts/blog-queue.json to continue publishing.');
      process.exit(0);
    }

    console.log(`📌 Next topic: "${queueItem.title}"`);
    console.log(`   Keyword: ${queueItem.targetKeyword}`);
    console.log(`   Category: ${queueItem.category}\n`);

    // Check for duplicate slug
    const existingSlugs = getExistingSlugs();

    // Generate the post
    const rawPost = await generatePost(queueItem);
    console.log(`   Generated slug: ${rawPost.slug}\n`);

    const post = validate(rawPost, queueItem);

    // Handle slug collision
    if (existingSlugs.includes(post.slug)) {
      const suffix = Math.random().toString(36).slice(2, 6);
      post.slug = `${post.slug}-${suffix}`;
      console.log(`⚠️  Slug collision. Using: ${post.slug}\n`);
    }

    // Fetch cover image
    const searchTerm = rawPost.imageSearchTerm || queueItem.category || 'email marketing';
    const image = await fetchCoverImage(searchTerm);
    if (image) console.log(`   Image: ${image.photographer} via Pexels\n`);

    // Write the post
    const markdown = buildMarkdown(post, image);
    const filePath = path.join(POSTS_DIR, `${post.slug}.md`);
    fs.writeFileSync(filePath, markdown, 'utf8');

    // Mark queue item as done
    queueItem.status = 'done';
    queueItem.publishedSlug = post.slug;
    queueItem.publishedDate = new Date().toISOString().split('T')[0];
    saveQueue(queue);

    console.log(`✅ Created: content/posts/${post.slug}.md`);
    console.log(`   Title: ${post.title}`);
    console.log(`   Words: ${post.body.split(/\s+/).length}`);
    console.log(`   Read time: ${post.readTime}`);
    console.log(`   Queue remaining: ${pendingCount - 1} posts`);
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    if (error.name === 'AccessDeniedException') {
      console.error('   → Make sure your IAM user has bedrock:InvokeModel permission');
      console.error('   → And that Claude Sonnet 4.6 is enabled in your Bedrock console');
    }
    process.exit(1);
  }
}

main();
