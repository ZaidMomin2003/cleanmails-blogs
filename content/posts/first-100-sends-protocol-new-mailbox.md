---
title: "The 'First 100 Sends' Protocol: How to Start a New Mailbox Safely"
slug: "first-100-sends-protocol-new-mailbox"
date: "2026-10-09"
author: "Cleanmails"
tags: ["Deliverability", "Cold Email", "Email Warmup", "SMTP", "Inbox Placement"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/7439124/pexels-photo-7439124.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "A businesswoman typing on a laptop in an office setting, using Slack for communication."
excerpt: "Most people burn new mailboxes in the first week without realizing it. Here's the exact protocol I use to safely ramp every new cold email domain from zero to full sending volume."
readTime: "9 min read"
photographerName: "cottonbro studio"
photographerUrl: "https://www.pexels.com/@cottonbro"
---

Most people burn new mailboxes in the first week and wonder why their open rates crater by week three. The first 100 sends you make from a new domain are not just important — they are *the* deciding factor for whether that mailbox ever reaches the inbox at scale.

This is the first 100 sends protocol for new mailbox setup that I've refined across dozens of domain deployments. Follow it exactly and you'll avoid the deliverability death spiral that kills most cold email campaigns before they start.

## Why the First 100 Sends Protocol for a New Mailbox Actually Matters

Here's the counterintuitive truth most people miss: **email providers don't judge your reputation by what you send — they judge it by the *signals* those sends generate.**

A new domain has no history. No trust. No signal. When you fire 200 emails on day one, Gmail's filters see an unknown entity blasting strangers and they make a decision fast. That decision is almost always: spam folder.

The data backs this up. According to Validity's 2023 Sender Intelligence Report, domains less than 30 days old have a spam placement rate 4-6x higher than domains with 90+ days of sending history — even when the technical setup (SPF, DKIM, DMARC) is identical. The age and *pattern* of sending matters as much as the infrastructure.

So the first 100 sends aren't about getting replies. They're about building a behavioral fingerprint that tells mailbox providers: *this is a legitimate human sender.*

## The Non-Negotiables Before Send #1

Don't touch the send button until these are done. No exceptions.

### 1. DNS Authentication — All Three Records

SPF, DKIM, and DMARC are table stakes. If you don't have all three configured correctly, you're not doing cold email — you're doing spam.

- **SPF**: Authorizes your sending IP to send on behalf of your domain
- **DKIM**: Cryptographically signs outgoing mail so it can't be spoofed
- **DMARC**: Tells receiving servers what to do when SPF/DKIM fail

Run your domain through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) right now. If anything comes back red, fix it before proceeding. I've seen campaigns where the sender had been running for 3 weeks and still had a broken DKIM record. Every single email was being soft-failed. Completely fixable, completely avoidable.

For a deeper dive into why authentication failures destroy deliverability, read [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication).

### 2. List Hygiene Before Day One

Sending to invalid addresses from a brand new domain is like walking into a job interview and immediately spilling coffee on the hiring manager. Bounce rates above 3-4% from a new domain trigger reputation flags that are extremely hard to recover from.

Run your list through the [Bulk Email Verifier](/tools/email-verifier) and remove:
- Hard bounces (invalid addresses)
- Role-based addresses (info@, support@, admin@)
- Addresses from domains with no MX records
- Catch-all addresses (treat these as risky for warmup)

For new mailbox warmup specifically, I'd recommend starting with *only* verified non-catch-all addresses. Save the catch-alls for when you have 60+ days of positive reputation behind you.

### 3. A Custom Tracking Domain

Using a shared tracking domain (the default in most platforms) is like arriving to a business meeting in a car that's been flagged by the police. Doesn't matter how well-dressed you are.

Set up a custom tracking subdomain on your sending domain (e.g., `track.yourdomain.com`) and point it to your tracking server. This isolates your reputation from every other sender on the platform.

---

## The 14-Day Ramp Schedule

Here's the exact schedule I use. This isn't theoretical — I've used this pattern across SaaS, agency, and consulting campaigns.

| Day | Sends Per Mailbox | Cumulative Total | Notes |
|-----|-------------------|------------------|-------|
| 1 | 5 | 5 | Warm contacts only (colleagues, clients) |
| 2 | 8 | 13 | Same |
| 3 | 10 | 23 | Mix in 3 cold prospects |
| 4 | 12 | 35 | 50/50 warm/cold |
| 5 | 15 | 50 | Cold prospects okay |
| 6 | Rest | 50 | No sends. Let signals process. |
| 7 | Rest | 50 | |
| 8 | 18 | 68 | Full cold list |
| 9 | 20 | 88 | |
| 10 | 12 | 100 | **You've hit 100 sends** |

After day 10 with healthy metrics (more on what healthy means below), you can begin scaling to 30, 40, then 50 sends per day per mailbox.

The weekend rest on days 6-7 is intentional. Real humans don't send business emails on weekends. This pattern reinforces the human sender fingerprint.

### The "Warm Contact" Trick Most People Skip

Days 1-4 should be seeded with emails to real people who will *open* and *reply*. This is not optional warmup theater — it's signal injection.

Who counts as a warm contact?
- Teammates, colleagues, co-founders
- Past clients you have a relationship with
- Your own personal email addresses across Gmail, Outlook, iCloud
- Warm prospects who already know you

Send them real, short emails. Ask a question. Get a reply. These positive engagement signals tell inbox providers that this domain sends mail people *want* to receive.

---

## What "Healthy Metrics" Look Like After 100 Sends

Before you scale, you need to pass a gut check on these numbers:

- **Bounce rate**: Under 2%. If it's above 3%, stop and re-verify your list.
- **Spam complaint rate**: Under 0.1%. Even one or two complaints from a new domain can cause serious damage.
- **Open rate** (if tracking): At least 30-40% on warm contacts; 15-25% on cold.
- **Reply rate**: Even one or two replies from the warm sends is a positive signal.

If you're seeing soft bounces from major providers like Gmail or Outlook, that's often a sign your sending IP has poor history. If you're on a shared SMTP infrastructure, this is a common problem. One reason I moved to [Cleanmails](https://cleanmails.com) for client deployments is that it lets me control the SMTP layer directly — I can see exactly which IP is sending, rotate senders across multiple mailboxes, and isolate any deliverability issues before they spread.

---

## The Spam Word Problem Nobody Talks About During Warmup

Here's something most warmup guides completely ignore: **your email copy during the ramp phase matters for reputation, not just replies.**

Spam filters analyze the content of your emails alongside the sender reputation. If your day-3 emails contain phrases like "guaranteed ROI," "no obligation," or "limited time offer," you're training the filter to associate your new domain with spam content from the start.

Before sending anything during the ramp phase, run your copy through the [Email Spam Word Checker](/tools/spam-checker). Remove every flagged phrase. During warmup, write the cleanest, most conversational copy you've ever written. Save the aggressive CTAs for after you've built a 60-day reputation.

For help writing copy that doesn't trigger filters *or* bore your prospects, check out [How to Write Cold Email Copy That Passes the 'Would I Reply?' Test](/blog/write-cold-email-copy-reply-test).

---

## Common Mistakes That Kill New Mailboxes (And How to Avoid Them)

### Mistake 1: Sending the Same Template to Everyone

When 50 emails leave a new domain with nearly identical text, spam filters notice. Use dynamic variables aggressively — not just `{{first_name}}` but company-specific lines, industry references, and genuinely personalized openers. The goal is zero two emails looking identical.

### Mistake 2: Enabling Open Tracking From Day One

Open tracking pixels add a redirect URL to every email. On a brand new domain, this URL has zero reputation. Some providers will penalize you for it. My recommendation: **disable open tracking for the first 14 days**. Use reply rate as your only success metric during warmup.

### Mistake 3: Skipping the Health Check Habit

Once you've hit 100 sends and started scaling, build a weekly review habit. I check sender reputation scores, bounce rates, and spam placement every Monday morning. The [Weekly Cold Email Health Check](/blog/weekly-cold-email-health-check-review) framework covers exactly what to look at and in what order.

### Mistake 4: Using Your Main Business Domain

Never cold email from your primary domain. Ever. Use a variation — `getcompanyname.com`, `trycompanyname.com`, `companynamemail.com`. If this secondary domain gets flagged, your core brand is protected. If you want to understand the full technical and strategic case for this, read [Why I Stopped Using Google Workspace for Cold Email](/blog/why-i-stopped-using-google-workspace-cold-email).

---

## The 30-Minute Checklist: Start Your New Mailbox Safely Today

If you do nothing else from this post, run through this checklist before your first send:

1. ✅ SPF record configured and validated
2. ✅ DKIM record configured and validated  
3. ✅ DMARC record set to `p=none` (monitor mode is fine to start)
4. ✅ Custom tracking subdomain pointed and working
5. ✅ List verified — bounces and role accounts removed
6. ✅ Day 1-4 sends queued to warm contacts only
7. ✅ Email copy checked for spam trigger words
8. ✅ Open tracking disabled for first 14 days
9. ✅ Weekend sends blocked in your sending schedule
10. ✅ Reply notifications set up so you catch engagement signals fast

This takes 25-30 minutes to complete. The cost of skipping it is a burned domain and 4-6 weeks of lost pipeline.

---

## My Honest Take

The warmup industry has overcomplicated what is fundamentally a simple behavioral problem: **new senders need to prove they're humans before they can act like marketers.**

You don't need a fancy warmup tool generating fake opens between bot accounts. You need a disciplined ramp schedule, clean lists, verified DNS, and copy that doesn't read like a 2008 infomercial. That's it.

The first 100 sends protocol for your new mailbox isn't glamorous. But the campaigns I've seen scale to thousands of sends per week without deliverability problems all started the same way — slowly, carefully, and with obsessive attention to the signals those first emails generated.

Do the boring work in week one. The pipeline follows.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [The Weekly Cold Email Health Check: 7 Things to Review Every Monday](/blog/weekly-cold-email-health-check-review)
- [Why 93% of Cold Emails Never Get Opened (And How to Fix It)](/blog/why-93-percent-cold-emails-never-get-opened)
- 🔧 Tool: [SPF/DKIM/DMARC Checker](/tools/dns-checker)