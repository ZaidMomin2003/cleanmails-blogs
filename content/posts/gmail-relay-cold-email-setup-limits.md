---
title: "Gmail Relay for Cold Email: Setup Guide and Limits You Need to Know"
slug: "gmail-relay-cold-email-setup-limits"
date: "2026-07-16"
author: "Cleanmails"
tags: ["Infrastructure", "Gmail", "SMTP", "Cold Email", "Deliverability"]
category: "Infrastructure"
coverImage: "https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "A woman using a laptop navigating a contemporary data center with mirrored servers."
excerpt: "Using Gmail as an SMTP relay for cold email sounds clever until you hit the hard limits that kill your campaign mid-send. Here's exactly how to set it up, where it breaks, and when to walk away."
readTime: "8 min read"
photographerName: "Christina Morillo"
photographerUrl: "https://www.pexels.com/@divinetechygirl"
---

Most people discover Gmail relay limits the hard way — at 11pm, staring at a bounce report, watching their campaign crater. Don't be that person.

If you're searching for a **Gmail relay cold email setup limits** guide that doesn't sugarcoat reality, you're in the right place. I'm going to walk you through the exact setup, the hard numbers Google publishes (and the softer limits they don't), and the scenarios where Gmail relay makes sense versus where it'll quietly destroy your sender reputation.

## What Gmail Relay Actually Is (And What It Isn't)

Gmail relay — specifically Google's SMTP relay service — lets you send email *through* Google's servers using your Google Workspace account credentials. Your email client or app authenticates with `smtp-relay.gmail.com` instead of your own mail server.

This is different from just using Gmail's SMTP (`smtp.gmail.com`) with an app password. The relay service is designed for organizations sending legitimate transactional or business email. Cold email sits in a grey zone that Google does not love.

Here's the thing most guides won't tell you: **Google's relay infrastructure is excellent for deliverability to Gmail recipients specifically.** Because you're routing through Google's own IP ranges, Gmail-to-Gmail delivery is near-perfect. But that advantage evaporates fast once you start hitting volume or behavioral filters.

## Gmail Relay Cold Email Setup: Step-by-Step

### Prerequisites

- Google Workspace account (Business Starter minimum, $6/month/user)
- Admin access to Google Admin Console
- A sending domain with SPF/DKIM configured (non-negotiable — if yours isn't set up, fix it first with this [SPF/DKIM/DMARC setup guide](/blog/spf-dkim-dmarc-setup-tutorial))

### Step 1: Enable SMTP Relay in Google Admin Console

1. Log into [admin.google.com](https://admin.google.com)
2. Navigate to **Apps → Google Workspace → Gmail → Routing**
3. Scroll to **SMTP relay service** and click **Configure**
4. Set the following:
   - **Allowed senders**: Only addresses in my domains
   - **Authentication**: Require SMTP Authentication
   - **Encryption**: Require TLS encryption
5. Save the configuration

### Step 2: SMTP Connection Settings

Use these in your sending tool or app:

```
Host:       smtp-relay.gmail.com
Port:       587 (TLS) or 465 (SSL)
Username:   your-account@yourdomain.com
Password:   your Google Workspace password
Encryption: STARTTLS (port 587) or SSL/TLS (port 465)
```

### Step 3: Verify Your SPF Record Includes Google

Your domain's SPF record must include Google's sending servers:

```
v=spf1 include:_spf.google.com ~all
```

If you're already including other providers, make sure you haven't exceeded the 10 DNS lookup limit — a surprisingly common cause of SPF failures. Run your domain through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) to confirm everything resolves correctly before you send a single email.

### Step 4: Test Before You Send

Send a test message to a Gmail address and a non-Gmail address. Check headers on both. You want to see:
- `smtp-relay.gmail.com` in the received chain
- DKIM signature passing
- SPF alignment passing
- No spam folder placement

If either test lands in spam, stop. Sending volume won't fix an authentication problem — it'll just accelerate your domain's reputation decline.

## The Hard Limits You Need to Know

This is where most guides get vague. Let me be specific.

### Published Google Limits

| Limit Type | Google Workspace (paid) | Free Gmail |
|---|---|---|
| Daily sending limit | 2,000 messages/day | 500 messages/day |
| Recipients per message | 2,000 (To + CC + BCC) | 500 |
| SMTP relay daily limit | 2,000 messages | Not available |
| Rate limit | ~20 messages/second | Lower |

The 2,000/day figure is per *user account*, not per domain. So if you have 5 Google Workspace users, you theoretically have 10,000 sends/day total across the relay.

### The Unpublished Limits That Actually Bite You

Here's what Google doesn't publish but what I've observed consistently:

**Behavioral throttling kicks in well before 2,000/day for cold email.** If you're sending to cold lists and generating spam complaints above ~0.1% (Google's stated threshold is 0.3%, but they act before that), your account gets throttled silently. Messages queue, then bounce, then your account gets flagged.

**New accounts have invisible warmup requirements.** A fresh Google Workspace account trying to send 500 cold emails on day one will trigger filters regardless of the published limits. Google's systems expect gradual volume ramps. Starting at 20-30/day and doubling every few days is the minimum viable warmup — same principle as any mailbox warmup, covered in detail in [how to warm up 20 mailboxes simultaneously without getting flagged](/blog/warm-up-20-mailboxes-simultaneously-without-flagged).

**IP reputation matters even through Google's relay.** You're sharing Google's relay IPs with thousands of other senders. This is a double-edged sword — Google's IPs have strong baseline reputation, but if enough senders on those IPs are flagged, your messages can get caught in collateral filtering at recipient servers. This is the [shared vs dedicated IP tradeoff](/blog/shared-vs-dedicated-ip-cold-email) in a slightly different form.

## When Gmail Relay Makes Sense for Cold Email

I'm going to give you my actual opinion here: **Gmail relay is a reasonable tool for low-volume, high-quality cold outreach. It is a terrible tool for scale.**

**Use Gmail relay when:**
- You're sending fewer than 200-300 cold emails/day
- Your list is tightly targeted (not scraped bulk lists)
- A significant portion of your prospects use Gmail/Google Workspace
- You're doing manual or semi-manual outreach, not automated sequences
- You already have Google Workspace for business email and want to avoid extra infrastructure

**Do not use Gmail relay when:**
- You're running multi-step cadences at scale
- You need sender rotation across multiple domains
- You're sending to unverified lists (clean your list first with the [Bulk Email Verifier](/tools/email-verifier) — bounces above 2% will get your relay flagged fast)
- You need detailed delivery analytics
- You've already had a Google account suspended for sending policy violations

## The Suspension Risk Is Real and Underappreciated

Here's the statistic that should make you think twice: Google terminated or suspended accounts for bulk sending violations at a dramatically higher rate in 2024 following their updated spam policy rollout. Anecdotally, from communities I follow, accounts sending cold email through Google Workspace relay saw a notable uptick in suspensions starting Q1 2024.

When Google suspends your Workspace account for sending violations, you lose access to *everything* — Gmail, Drive, Calendar, the works. If your business runs on Google Workspace, that's a catastrophic risk to take on for the sake of using familiar SMTP credentials.

This is exactly why I wrote [why I stopped using Google Workspace for cold email](/blog/why-i-stopped-using-google-workspace-cold-email) — the convenience isn't worth the single point of failure.

## A Practical Alternative Architecture

If you're hitting Gmail relay limits or want to scale beyond what Google allows, the right move is dedicated cold email infrastructure with proper SMTP rotation.

The pattern that works:
1. Separate cold email sending domains from your primary business domain
2. Use dedicated SMTP infrastructure (not Gmail relay)
3. Rotate across multiple senders to distribute volume
4. Keep primary Google Workspace untouched and safe

This is the architecture that [SMTP rotation at scale](/blog/smtp-rotation-explained) is built around. The core insight: no single sending identity should be responsible for your entire outreach volume.

For teams who want this without stitching together five different tools, [Cleanmails](/) handles inbuilt SMTP, sender rotation, and cadences in one platform with a one-time payment — relevant if you're tired of paying monthly per seat just to send emails.

## Quick Diagnostic: Is Gmail Relay Hurting Your Deliverability Right Now?

Run through this checklist:

- [ ] SPF record includes `_spf.google.com` and passes validation
- [ ] DKIM is enabled in Google Admin → Gmail → Authenticate email
- [ ] DMARC record exists with at least `p=none` and a reporting address
- [ ] Daily sends are below 300/day per account
- [ ] List bounce rate is below 2% (verify with [Bulk Email Verifier](/tools/email-verifier))
- [ ] No spam complaint rate above 0.1% in Google Postmaster Tools
- [ ] Account is at least 30 days old with gradual volume ramp
- [ ] No spam trigger words in subject lines (check with [Email Spam Word Checker](/tools/spam-checker))

If you're failing more than two of these, Gmail relay is actively working against you.

## The Bottom Line

Gmail relay for cold email is a legitimate tool with a narrow use case. It works well for low-volume, high-quality outreach where you're not pushing Google's behavioral filters. It breaks badly — and takes your whole Google account with it — when you treat it like a bulk sending service.

The 2,000/day published limit is not the real limit. The real limit is how quickly Google's systems decide your sending pattern looks like spam. For most cold email campaigns, that threshold is much lower.

Set it up correctly, respect the constraints, and use it for what it's good at. For anything beyond 200-300 daily sends, build infrastructure that's designed for cold email from the ground up — not retrofitted from a collaboration tool.

---

**Related:**
- [Why I Stopped Using Google Workspace for Cold Email](/blog/why-i-stopped-using-google-workspace-cold-email)
- [SMTP Rotation: How to Send at Scale Without Getting Blacklisted](/blog/smtp-rotation-explained)
- [How to Set Up SPF, DKIM, and DMARC in Under 10 Minutes](/blog/spf-dkim-dmarc-setup-tutorial)
- 🛠️ Tool: [SPF/DKIM/DMARC Checker](/tools/dns-checker)