---
title: "The Email Header Analysis: How to Diagnose Deliverability Problems"
slug: "email-header-analysis-deliverability-diagnosis"
date: "2026-10-11"
author: "Cleanmails"
tags: ["Deliverability", "Email Authentication", "Cold Email", "SMTP", "Spam"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "A woman using a laptop navigating a contemporary data center with mirrored servers."
excerpt: "Your open rates dropped 40% overnight and you have no idea why. The answer is sitting inside every email you've ever sent — in the headers most people never look at."
readTime: "9 min read"
photographerName: "Christina Morillo"
photographerUrl: "https://www.pexels.com/@divinetechygirl"
---

Your open rates dropped 40% overnight and you have no idea why. The answer is sitting inside every email you've ever sent — buried in the headers that 99% of cold emailers have never once read.

Email header analysis for deliverability diagnosis is one of those skills that separates people who guess their way through inbox problems from people who fix them in 20 minutes. I've diagnosed hundreds of deliverability issues this way — misconfigured SPF records, broken DKIM signatures, spam filter rejections, relay hops adding blacklisted IPs — all of it visible if you know what you're looking at.

This is the guide I wish I had three years ago.

## What Email Headers Actually Are (And Why They Matter)

Every email you send carries two parts: the body (what you see) and the headers (what mail servers see). Headers are metadata — a chain of instructions and stamps that document exactly where your email came from, how it traveled, and what authentication checks it passed or failed.

Here's the counterintuitive part: **spam filters make their decision based almost entirely on headers, not your email copy.** You can spend hours crafting the perfect cold email, but if your headers show a broken DKIM signature or a relay through a flagged IP, Gmail's filters have already made up their mind before they read a single word.

For a deeper look at the authentication side of this, read [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication) — it covers SPF, DKIM, and DMARC from the ground up.

## How to Access Email Headers in 60 Seconds

Before you can diagnose anything, you need to pull the raw headers. Here's how to do it across the most common platforms:

**Gmail:**
1. Open the email
2. Click the three dots (⋮) in the top right
3. Select "Show original"
4. You'll see the full raw header + body

**Outlook:**
1. Open the email
2. File → Properties
3. Headers are in the "Internet headers" box

**Apple Mail:**
1. View → Message → All Headers

Once you have the raw headers, copy everything above the first blank line (that blank line separates headers from the body). Paste it into Google's [Message Header Analyzer](https://toolbox.googleapps.com/apps/messageheader/) or MXToolbox's header analyzer.

But honestly, reading them manually is faster once you know what to look for.

## The Email Header Analysis Deliverability Diagnosis: What to Look For

Here are the seven fields I check in order, every single time.

### 1. Authentication Results (The Most Important Section)

Look for a block that starts with `Authentication-Results:`. This is where the receiving server documents whether your email passed or failed each authentication check.

```
Authentication-Results: mx.google.com;
  dkim=pass header.i=@yourdomain.com header.s=selector1;
  spf=pass (google.com: domain of you@yourdomain.com designates 12.34.56.78 as permitted sender);
  dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=yourdomain.com
```

What you want to see: `pass` on all three — DKIM, SPF, and DMARC.

What's bad:
- `dkim=fail` → Your DKIM signature is broken or missing
- `spf=softfail` → Your sending IP isn't in your SPF record
- `dmarc=fail` → Both SPF and DKIM failed alignment

A `dmarc=fail` is often a death sentence for deliverability. Gmail and Microsoft 365 will either send it straight to spam or reject it outright depending on your DMARC policy.

Run your domain through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) right now if you haven't verified your records recently. I've seen campaigns tank because someone updated their DNS and accidentally broke an SPF record — this tool catches it in 30 seconds.

### 2. Received Headers (The Delivery Chain)

Every server that touches your email adds a `Received:` header. They stack from bottom (first) to top (last). Reading them bottom-to-top shows you the exact path your email traveled.

```
Received: from mail.yourdomain.com (mail.yourdomain.com [12.34.56.78])
  by mx.google.com with ESMTPS id ...
  for <prospect@theirdomain.com>;
  Mon, 15 Jan 2024 09:23:41 -0800
```

What to check:
- **Number of hops:** More than 3-4 hops is suspicious and adds latency
- **IP addresses:** Copy each IP and check it against [MXToolbox Blacklist Checker](https://mxtoolbox.com/blacklists.aspx). One blacklisted relay kills your deliverability even if your own IP is clean
- **Timestamps:** Huge gaps between hops (>30 seconds) often indicate a server under load or flagged for review

### 3. The X-Spam Headers

Many mail servers add `X-Spam-Status` or `X-Spam-Score` headers that tell you exactly how their spam filter scored your email.

```
X-Spam-Status: No, score=1.8 required=5.0
X-Spam-Checker-Version: SpamAssassin 3.4.6
X-Spam-Report:
  * 0.8 HTML_MESSAGE BODY: HTML included in message
  * 0.5 MISSING_HEADERS Missing To: header
  * 0.5 RCVD_IN_DNSWL_NONE RBL: Sender listed at dnswl.org, no trust
```

This is gold. SpamAssassin and similar filters literally show you point-by-point why they're flagging your email. A score above 5.0 typically means spam folder. I've seen campaigns with scores of 8+ because someone used a shared SMTP relay that had `RCVD_IN_SBL` (Spamhaus Block List) hits.

### 4. Message-ID Format

Legitimate emails have a `Message-ID` that looks like this:
```
Message-ID: <unique-string@yourdomain.com>
```

If your Message-ID shows a third-party domain (not your sending domain), that's a red flag. It means your email is routing through a third-party SMTP relay and the headers are exposing it. Some spam filters score this negatively.

This is one reason I run Cleanmails with its built-in SMTP — the Message-ID always reflects my actual sending domain, not some shared relay's infrastructure.

### 5. Return-Path Alignment

```
Return-Path: <bounce@yourdomain.com>
From: You <you@yourdomain.com>
```

For DMARC to pass, the `Return-Path` domain needs to align with the `From` domain. If you're using a third-party tool that sets `Return-Path: bounce@tool-vendor.com` while your `From` shows `you@yourdomain.com`, you'll get DMARC misalignment failures.

This is an extremely common problem with tools that use shared bounce-handling infrastructure. Check it.

### 6. Content-Type and Encoding Headers

```
Content-Type: multipart/alternative; boundary="000000000000abc12345"
```

If your email is `text/html` only with no `text/plain` version, that's a spam signal. Legitimate email clients send both. Every cold email tool worth using sends multipart/alternative automatically — but verify it's happening.

### 7. X-Mailer and User-Agent Headers

Some tools expose themselves here:
```
X-Mailer: Mailchimp Mailer
```

Certain X-Mailer values are on spam filter watch lists because they're associated with bulk sending. Ideally, this header is either absent or shows something neutral.

## A Real Diagnosis Example

Here's a situation I ran into last year. Open rates on a client's campaign dropped from 34% to 11% in a single week. Nothing in the copy changed. Nothing in the list changed.

Pulled the headers on a test send. Found this:

```
Authentication-Results: mx.google.com;
  dkim=fail (signature did not verify);
  spf=pass;
  dmarc=fail (p=QUARANTINE)
```

And in the Received chain, there was a relay IP that hit two Spamhaus blocklists.

The DKIM failure turned out to be a DNS propagation issue — they'd rotated their DKIM keys but the old selector was still in the header. The relay IP issue was because their ESP had silently moved them to a shared IP pool that had reputation problems.

Fix: Updated DKIM selector in the sending config, switched to a dedicated IP. Open rates recovered to 31% within 5 days.

Total diagnosis time: 22 minutes.

## The 30-Minute Deliverability Audit Using Headers

Here's a repeatable process you can run right now:

1. **Send a test email** to a Gmail account, a Microsoft 365 account, and your own domain
2. **Pull headers** from all three (each server will give you different spam scoring)
3. **Check Authentication-Results** — all three should show `dkim=pass`, `spf=pass`, `dmarc=pass`
4. **Run each IP in the Received chain** through a blacklist checker
5. **Note the X-Spam-Score** if present — anything above 3.0 warrants investigation
6. **Verify Return-Path alignment** matches your From domain
7. **Check for multipart/alternative** in Content-Type

For a broader weekly routine that includes this check, see [The Weekly Cold Email Health Check: 7 Things to Review Every Monday](/blog/weekly-cold-email-health-check-review) — it puts header analysis into a repeatable maintenance schedule.

Also run your list through the [Bulk Email Verifier](/tools/email-verifier) if you're seeing high bounce rates alongside deliverability drops. High bounces damage your sender reputation and the two problems compound each other.

## The Surprising Insight Nobody Talks About

Here's something that took me a long time to understand: **your deliverability problems are almost never about your content.** 

The cold email industry has spent years obsessing over spam words, subject line formulas, and copy frameworks. And yes, [Why 93% of Cold Emails Never Get Opened (And How to Fix It)](/blog/why-93-percent-cold-emails-never-get-opened) makes the case that copy matters. It does.

But in my experience diagnosing campaigns, the split is roughly:
- **70% of deliverability problems** → authentication failures, blacklisted IPs, relay issues (all visible in headers)
- **20%** → sending volume/warm-up issues
- **10%** → content/spam word triggers

You can use the [Email Spam Word Checker](/tools/spam-checker) to rule out content issues in under a minute. If your copy checks out clean, the problem is almost certainly in the headers.

## What Good Headers Look Like: A Reference

| Header Field | What You Want | Red Flag |
|---|---|---|
| `dkim=` | `pass` | `fail`, `none` |
| `spf=` | `pass` | `fail`, `softfail` |
| `dmarc=` | `pass` | `fail`, `quarantine` |
| Return-Path domain | Matches From domain | Third-party domain |
| Received chain IPs | Clean (0 blacklists) | Any blacklist hit |
| X-Spam-Score | Below 3.0 | Above 5.0 |
| Content-Type | `multipart/alternative` | `text/html` only |
| Relay hops | 2-3 max | 5+ |

## Final Thoughts

Email header analysis is not glamorous. It's not a growth hack. It's plumbing — and most people ignore their plumbing until the pipes burst.

The practitioners who consistently hit 35-45% open rates aren't necessarily better copywriters. They're better engineers. They check their headers after every major send. They know what `dmarc=fail` means before their open rates tank. They treat deliverability like infrastructure, not an afterthought.

Start with one test send today. Pull the headers. Run the checklist above. I'd bet money you find at least one thing worth fixing.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [The Weekly Cold Email Health Check: 7 Things to Review Every Monday](/blog/weekly-cold-email-health-check-review)
- [Why 93% of Cold Emails Never Get Opened (And How to Fix It)](/blog/why-93-percent-cold-emails-never-get-opened)
- 🛠️ Tool: [SPF/DKIM/DMARC Checker](/tools/dns-checker)