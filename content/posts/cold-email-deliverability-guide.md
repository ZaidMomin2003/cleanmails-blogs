---
title: "The Complete Cold Email Deliverability Guide for 2026"
slug: "cold-email-deliverability-guide"
date: "2026-04-28"
author: "Cleanmails"
tags: ["deliverability", "cold email", "SMTP", "DNS"]
category: "Deliverability"
coverImage: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&q=80"
coverImageAlt: "Email inbox on a laptop screen"
excerpt: "Deliverability is the single most important factor in cold email success. This guide covers everything — DNS records, warm-up, sending limits, and the exact setup that gets you to the inbox."
readTime: "12 min read"
photographerName: "Solen Feyissa"
photographerUrl: "https://unsplash.com/@solenfeyissa"
---

Cold email only works if your emails actually land in the inbox. Sounds obvious, but most people skip the fundamentals and wonder why their open rates are 2%.

This guide covers the complete deliverability stack — from DNS records to sending behavior — so you can build a setup that consistently hits the primary inbox.

## Why Deliverability Fails

Before fixing anything, understand why emails end up in spam:

- **Missing or misconfigured DNS records** (SPF, DKIM, DMARC)
- **Sending from a fresh domain** with no reputation
- **High bounce rates** from unvalidated lists
- **Spam trigger words** in subject lines or body copy
- **Sending too fast** from a new mailbox
- **Shared IP reputation** from cheap ESPs

The good news: all of these are fixable with the right infrastructure.

## Step 1: Domain Setup

Never send cold email from your main business domain. Use a dedicated sending domain — something like `getcleanmails.com` or `trycleanmails.io`.

This protects your primary domain's reputation. If a sending domain gets flagged, you swap it out without affecting your main brand.

### Buy 3–5 domains

Spread your sending volume across multiple domains. Each domain should have 2–3 mailboxes. This keeps per-mailbox volume low, which is critical for deliverability.

Good domain registrars: Namecheap, Cloudflare Registrar, Google Domains.

## Step 2: DNS Records

This is where most people mess up. You need three records on every sending domain.

### SPF Record

SPF tells receiving servers which IPs are allowed to send email on behalf of your domain.

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com ~all
```

If you're using Cleanmails' inbuilt SMTP, add your server IP:

```
v=spf1 ip4:YOUR.SERVER.IP include:_spf.google.com ~all
```

### DKIM Record

DKIM adds a cryptographic signature to every email, proving it wasn't tampered with in transit. Your email provider generates the key — you add it to DNS.

```
Type: TXT
Host: google._domainkey (or your provider's selector)
Value: v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY
```

### DMARC Record

DMARC tells receiving servers what to do when SPF or DKIM fails. Start with a monitoring-only policy:

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

After 2–4 weeks of monitoring, tighten to `p=quarantine` then `p=reject`.

## Step 3: Email Warm-Up

A fresh mailbox has zero sending reputation. If you blast 500 emails on day one, you'll get flagged immediately.

Warm-up means gradually increasing your sending volume over 4–6 weeks:

| Week | Daily Emails Per Mailbox |
|------|--------------------------|
| 1    | 5–10                     |
| 2    | 15–25                    |
| 3    | 30–50                    |
| 4    | 60–80                    |
| 5+   | 80–100                   |

During warm-up, send to real people who will open and reply. Warm-up tools like Mailreach or Instantly's warm-up network work by sending emails between their users' mailboxes and marking them as not spam.

## Step 4: List Validation

Sending to invalid emails destroys your sender reputation. A bounce rate above 5% is a red flag for most email providers.

Before importing any list, run it through an email validator. Cleanmails has a built-in validation engine that checks:

- **MX records** — does the domain accept email?
- **SMTP handshake** — does the specific mailbox exist?
- **Catch-all detection** — is the domain accepting everything (unreliable)?
- **Disposable email detection** — 126k+ known disposable domains

Remove all invalid, catch-all, and disposable addresses before sending.

## Step 5: Sending Behavior

Even with perfect DNS and a warmed-up mailbox, bad sending behavior will get you flagged.

### Daily limits

Keep it under 100 emails per mailbox per day. If you need more volume, add more mailboxes — don't push a single mailbox harder.

### Sending windows

Send during business hours in your target timezone. Emails sent at 3am look automated (because they are, but you don't want it to be obvious).

### Delays between emails

Add random delays between sends — 60 to 180 seconds. Cleanmails handles this automatically with its cadence engine.

### Unsubscribe handling

Always include an unsubscribe mechanism. Not just for legal compliance — it keeps your complaint rate low, which directly affects deliverability.

## Step 6: Monitor Your Reputation

Set up Google Postmaster Tools and Microsoft SNDS to monitor your domain and IP reputation. These are free and give you direct insight into how Gmail and Outlook see your sending.

Check weekly:
- Domain reputation (should be Medium or High)
- IP reputation
- Spam rate (keep below 0.1%)
- Authentication pass rate (should be 100%)

## The Cleanmails Advantage

Cleanmails handles most of this automatically:

- **Inbuilt SMTP engine** with dedicated IP per installation
- **Automatic sender rotation** across all your mailboxes
- **Built-in email validation** before every send
- **Cadence timing controls** with randomized delays
- **Blacklist monitoring** for your sending IPs

You set it up once, and the system manages your reputation automatically.

## Summary

Deliverability isn't magic — it's infrastructure. Get your DNS right, warm up properly, validate your lists, and respect sending limits. Do those four things and you'll consistently outperform competitors who skip the fundamentals.

If you want a setup that handles all of this out of the box, [Cleanmails](https://cleanmails.online) is built exactly for this.

**Related:** [SMTP Rotation Explained](/blog/smtp-rotation-explained) · [How to Warm Up a New Cold Email Domain](/blog/how-to-warm-up-a-new-cold-email-domain) · [Why Your Emails Land in Spam](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication) · [Free SPF/DKIM/DMARC Checker →](https://cleanmails.online/tools/dns-checker) · [Free Spam Word Checker →](https://cleanmails.online/tools/spam-checker)
