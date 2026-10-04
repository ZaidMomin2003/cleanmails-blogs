---
title: "The Complete Guide to Email Warm-Up Schedules by Mailbox Provider"
slug: "email-warmup-schedule-by-provider-guide"
date: "2026-10-04"
author: "Cleanmails"
tags: ["deliverability", "email warmup", "cold email", "SMTP", "inbox placement"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/5605061/pexels-photo-5605061.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "A glowing neon envelope symbol against a black background, conveying messaging or email concept."
excerpt: "Most email warmup advice is dangerously generic — treating Gmail, Outlook, and custom domains the same way. Here's the exact warmup schedule I use for each provider, with day-by-day send volumes and the mistakes that will get you blacklisted."
readTime: "8 min read"
photographerName: "Maksim Goncharenok"
photographerUrl: "https://www.pexels.com/@maksgelatin"
---

Most people warming up a new mailbox are following advice written for a world that no longer exists. They ramp from 5 to 50 emails over 30 days, declare victory, and wonder why their open rates collapse in week six.

The real problem? **Every major mailbox provider scores new sending infrastructure differently.** A warmup schedule that works perfectly for Google Workspace will get an Outlook-linked domain flagged in 10 days. I've tested this across dozens of domains — and the email warmup schedule by provider guide you're reading right now is what I wish existed two years ago.

---

## Why Generic Warmup Advice Is Getting You Blacklisted

Here's the counterintuitive insight most deliverability guides bury: **warming up too slowly can hurt you just as much as warming up too fast.**

Mailbox providers don't just look at volume. They look at *engagement rate relative to volume*. If you're sending 10 emails a day and only 2 are being opened, you've already established a 20% engagement baseline — and that follows your domain forever.

I've seen people spend 45 days "carefully" warming up a domain with low-quality seed lists, only to launch their real campaign and hit a 3% open rate because the domain's reputation was poisoned from day one.

The lesson: warmup quality beats warmup patience, every single time.

---

## The Core Variables That Differ by Provider

Before getting into the schedules, understand what each provider actually measures:

| Provider | Primary Trust Signal | Blacklist Sensitivity | Recovery Time After Flag |
|---|---|---|---|
| Google (Gmail/Workspace) | Domain age + SPF/DKIM alignment | Medium | 7–14 days |
| Microsoft (Outlook/Office 365) | IP reputation + sending consistency | High | 14–30 days |
| Yahoo/AOL | Volume spikes + spam complaints | Very High | 30–60 days |
| Custom/Private ISPs | DMARC pass rate + bounce rate | Low–Medium | 3–7 days |

Microsoft is the strictest. Full stop. If you're sending to a B2B list where 60%+ of recipients are on Outlook or Office 365 (which is typical in enterprise), your warmup schedule needs to be built around Microsoft's tolerance — not Google's.

Before you even start warming up, make sure your DNS is clean. Run your domain through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) — if any of those are misconfigured, no warmup schedule will save you. Also worth reading: [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication).

---

## Email Warmup Schedule by Provider: The Exact Day-by-Day Breakdown

### Google Workspace / Gmail (Sending to Gmail Recipients)

Google is the most forgiving of the major providers for new domains, but it's not a free pass. Their machine learning systems are watching engagement signals from day one.

**Week 1 (Days 1–7):**
- Send 5–10 emails/day
- Use real people in your network or high-quality seed accounts
- Target 40%+ open rate minimum — if you can't hit this, fix your subject lines before scaling
- No links in emails during this phase

**Week 2 (Days 8–14):**
- Scale to 20–30 emails/day
- Start including one link per email (your website, no redirect links)
- Monitor bounce rate — keep it under 2%
- First week you can run a small test to real prospects (5–10 max)

**Week 3 (Days 15–21):**
- Scale to 50–75 emails/day
- Begin testing actual cold email copy
- Watch for any Gmail Postmaster Tools flags (set this up on day 1, not day 21)

**Week 4 (Days 22–30):**
- Scale to 100–150 emails/day
- Full campaign launch ready
- Maintain 30%+ open rate to protect domain reputation

**Google-specific warning:** Gmail's spam filters are heavily influenced by recipient behavior. If someone marks your email as spam, it affects *all* future emails from your domain to Gmail users — not just that recipient. One spam complaint per 1,000 emails is the threshold I keep an eye on.

---

### Microsoft Outlook / Office 365 (The One Everyone Gets Wrong)

Microsoft uses a system called Smart Network Data Services (SNDS) and their own IP/domain reputation scoring. New IPs sending to Outlook inboxes are treated with extreme suspicion.

**Week 1 (Days 1–7):**
- Max 5 emails/day — and I mean 5, not 8
- Only send to known contacts who will open and reply
- Do NOT use any email warmup tools that use fake engagement on this provider — Microsoft detects automation patterns
- Enable read receipts where possible

**Week 2 (Days 8–14):**
- Scale to 15 emails/day
- Still no cold prospects
- Check your IP against Microsoft's SNDS dashboard
- If you see any yellow or red flags, stop and investigate before continuing

**Week 3 (Days 15–21):**
- Scale to 30–40 emails/day
- Begin introducing cold prospects slowly (10–15/day max)
- Personalization is non-negotiable here — generic blasts will tank your reputation fast

**Week 4–5 (Days 22–35):**
- Scale to 75 emails/day
- Continue monitoring SNDS
- Do not exceed 100 emails/day to Outlook recipients until you have 45+ days of clean sending history

**The hard truth about Outlook:** If you get flagged, Microsoft's delisting process is painful and slow. I've had domains take 3 weeks to recover. Prevention is everything here. This is also why I stopped using shared SMTP infrastructure — if someone else on your relay gets flagged, your domain suffers too. It's one of the reasons I moved to a self-hosted setup using [Cleanmails](https://cleanmails.com), where my sending IP is isolated and I control the warmup timeline completely.

---

### Yahoo / AOL

Yahoo is volatile. It's the provider that goes from "working fine" to "everything in spam" overnight with no warning.

**Week 1–2:** Max 10 emails/day. Yahoo has almost no tolerance for volume spikes on new domains.

**Week 3–4:** Scale to 25–30 emails/day. Watch bounce rates obsessively — Yahoo's addresses go dormant at a high rate, and sending to dead addresses is a fast path to their blacklist.

**Week 5+:** 50–75 emails/day max. I personally don't push Yahoo-heavy lists hard regardless of warmup history.

**Pro tip:** Clean your list before sending to Yahoo addresses. Run it through the [Bulk Email Verifier](/tools/email-verifier) and remove any addresses that don't pass — Yahoo bounces are particularly punishing.

---

### Custom Domain / Private ISP Recipients

These are your `@companyname.com` recipients running their own mail server or a smaller hosted provider. They're generally the most forgiving because there's no centralized reputation system.

**Week 1–2:** 20–30 emails/day is fine for most custom domains.
**Week 3+:** Scale to 100+ emails/day if bounce rates stay under 3%.

The main risk with custom domains isn't volume — it's authentication. If your SPF or DKIM isn't set up correctly, private mail servers will flat-out reject your email. No warmup schedule fixes a broken DMARC record.

---

## The Sender Rotation Strategy Most People Ignore

Here's what separates amateur warmup strategy from professional infrastructure: **you should never warm up just one mailbox.**

For any campaign sending 200+ emails/day, I run 3–5 mailboxes in rotation. Each one goes through its own warmup schedule, then I distribute the send volume across all of them. This does two things:

1. Keeps each individual mailbox well within safe sending limits
2. Protects your campaign if one mailbox gets flagged — the others keep running

The math is simple: 5 warmed mailboxes at 100 emails/day = 500 emails/day total. That's a real campaign volume with no single mailbox taking on dangerous load.

If you want to go deeper on how warmup fits into your broader cold email infrastructure, the [weekly cold email health check](/blog/weekly-cold-email-health-check-review) I run every Monday covers exactly how to monitor these signals in under 30 minutes.

---

## 30-Minute Action Plan: Start Your Warmup Right Now

1. **Register your sending domain** (use a subdomain variant, not your primary domain)
2. **Configure SPF, DKIM, and DMARC** — use the [SPF/DKIM/DMARC Checker](/tools/dns-checker) to verify
3. **Identify your recipient mix** — what percentage are on Gmail vs Outlook vs Yahoo? This determines which warmup schedule is your bottleneck
4. **Set up Gmail Postmaster Tools and Microsoft SNDS** — both are free and take 10 minutes to configure
5. **Start Day 1 sends** with real contacts who will actually open and reply
6. **Clean your prospect list** before it ever touches your warmed mailbox — use the [CSV Email List Cleaner](/tools/csv-cleaner) to strip invalid addresses
7. **Check for spam trigger words** in your warmup emails using the [Email Spam Word Checker](/tools/spam-checker)

Do steps 1–4 today. The rest follows naturally.

---

## The Opinion No One Wants to Hear

Most "email warmup services" are selling you a false sense of security. Automated warmup tools that ping fake seed accounts back and forth have been partially devalued by Google and Microsoft — both have gotten better at detecting synthetic engagement patterns.

Real warmup means real humans opening, reading, and occasionally replying to your emails. If you can't get 10 real people to engage with your warmup emails in week one, your copy isn't ready for cold prospects anyway.

The deliverability problem and the copy problem are the same problem.

For more on why your current setup might be working against you, see [Why I Stopped Using Google Workspace for Cold Email](/blog/why-i-stopped-using-google-workspace-cold-email) — it covers the infrastructure decisions that affect warmup outcomes in ways most guides never mention.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [The Weekly Cold Email Health Check: 7 Things to Review Every Monday](/blog/weekly-cold-email-health-check-review)
- [Why I Stopped Using Google Workspace for Cold Email](/blog/why-i-stopped-using-google-workspace-cold-email)
- 🛠️ Tool: [SPF/DKIM/DMARC Checker](/tools/dns-checker)