---
title: "The Anti-Spam Checklist: 20 Things That Trigger Spam Filters"
slug: "anti-spam-checklist-spam-filter-triggers"
date: "2026-09-26"
author: "Cleanmails"
tags: ["Deliverability", "Spam Filters", "Cold Email", "Email Authentication", "Best Practices"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/8477652/pexels-photo-8477652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Delicious breakfast box featuring fried egg, sliced meat, and fresh vegetables on a rustic wooden table."
excerpt: "Most cold emailers think spam filters care about one or two things. They're wrong — and that blind spot is why their emails never land in the inbox. Here are 20 specific triggers killing your deliverability right now."
readTime: "9 min read"
photographerName: "Jeff Vinluan"
photographerUrl: "https://www.pexels.com/@jeff-vinluan-20921030"
---

Most people think spam filters are looking for one or two obvious things — a sketchy subject line, maybe a blacklisted IP. So they fix those two things and wonder why they're still landing in spam 40% of the time.

The reality? Modern spam filters like Google's ML-based systems score your email across **hundreds of signals simultaneously**. This anti-spam checklist covers the 20 spam filter triggers I see most often — including several that will genuinely surprise you.

---

## The Full Anti-Spam Checklist: 20 Spam Filter Triggers to Eliminate Today

I've split these into five categories based on where the problem originates. Fix them in order — infrastructure problems will tank you even if your copy is perfect.

---

## Category 1: Infrastructure & Authentication Failures

These are non-negotiable. If your authentication is broken, nothing else matters.

### 1. Missing or Broken SPF Record

SPF tells receiving mail servers which IPs are allowed to send on behalf of your domain. If it's missing, misconfigured, or has more than 10 DNS lookups (the hard limit), you'll fail SPF checks silently. Most senders don't even know they're failing.

**Fix it:** Run your domain through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) right now. Takes 30 seconds.

### 2. No DKIM Signature

DKIM cryptographically signs your emails so receiving servers can verify the message wasn't tampered with in transit. No DKIM = no trust signal. Gmail and Outlook both weight DKIM heavily in their filtering decisions.

### 3. DMARC Set to `none` (or Missing Entirely)

Here's a counterintuitive one: having DMARC set to `p=none` is almost as bad as having no DMARC at all for trust purposes. It signals to receiving servers that you haven't committed to enforcing your own authentication policy. Set it to `p=quarantine` at minimum once you've confirmed your SPF and DKIM are passing.

### 4. Sending from a Brand-New Domain

A domain registered last Tuesday sending 500 emails on Thursday is a massive red flag. Spam filters look at domain age. I've seen deliverability jump from 34% to 81% inbox placement just by switching from a 3-day-old domain to one that was 45 days old with proper warmup history.

If you're managing multiple sending domains, read [how to warm up 20 mailboxes simultaneously without getting flagged](/blog/warm-up-20-mailboxes-simultaneously-without-flagged) — it covers the timeline and sequencing in detail.

### 5. Skipping the Warmup Process Entirely

Sending volume is itself a signal. A mailbox that jumps from 0 to 200 emails on day one gets flagged automatically. Period. The warmup process isn't optional — it's the baseline for inbox placement. If you want to do it without paying for a dedicated tool, [this guide covers warming up 50 mailboxes for free](/blog/warm-up-mailboxes-free-no-tool).

---

## Category 2: List Quality Problems

This is where most mid-level senders fail. They fix their authentication, then keep blasting dirty lists.

### 6. High Hard Bounce Rate

Anything above 2% hard bounces is a yellow flag. Above 5% and you're actively damaging your sender reputation. Gmail and Outlook track bounce rates at the IP and domain level. Once your reputation drops, it takes weeks to recover.

**Fix it:** Verify your list before every send using the [Bulk Email Verifier](/tools/email-verifier). Not after you've already bounced 200 addresses — before.

### 7. Sending to Role-Based Addresses

`info@`, `hello@`, `support@`, `sales@` — these are almost always monitored by multiple people or filtered automatically. They have higher spam-report rates and lower engagement rates. Both hurt you. Scrub them from your list.

### 8. Purchased or Scraped Lists with Spam Traps

Spam traps are email addresses specifically set up to catch senders who don't practice good list hygiene. They never opt in, never engage, and hitting even one can get your IP blacklisted. If you bought a list from anyone, assume it has traps. Use the [CSV Email List Cleaner](/tools/csv-cleaner) to strip obvious problems before you import.

### 9. Emailing Addresses That Haven't Engaged in 12+ Months

This surprises people: **low engagement is a spam signal, not just a vanity metric issue.** Gmail explicitly uses engagement data (opens, replies, moves to inbox, etc.) to classify future messages from your domain. Mailing a graveyard list actively hurts your deliverability for everyone else you send to.

---

## Category 3: Content & Copy Triggers

Spam filters have gotten dramatically better at reading email content. The old "just avoid the word FREE" advice is embarrassingly outdated.

### 10. Spam Trigger Words in Subject Lines

This is the one everyone knows about and still gets wrong. It's not just individual words — it's combinations and context. "Free" alone isn't a killer. "FREE consultation — Act NOW before it expires!!!" is a different story.

Run your subject lines through the [Email Spam Word Checker](/tools/spam-checker) before sending. It'll flag specific phrases, not just individual words.

### 11. All-Caps Words or Excessive Punctuation

`URGENT!!!` or `Don't MISS this OPPORTUNITY!!!!` — spam filters have seen these patterns 10 billion times. They pattern-match on capslock and punctuation density. One exclamation mark in a subject line: probably fine. Four: you're done.

### 12. Image-Heavy Emails with Minimal Text

Spam filters can't read images (not reliably, anyway). A high image-to-text ratio looks like you're trying to hide your content from filters — because historically, spammers did exactly that. Cold email should be plain text or near-plain text. If you're sending HTML newsletters, your image-to-text ratio matters.

### 13. Single Large Image Emails

Related but distinct: emails that are literally just one image are automatically suspicious. No legitimate cold email looks like that. If you're using a template that's basically a banner image with a button, rethink it entirely for cold outreach.

### 14. Too Many Links

One or two links in a cold email: normal. Five links: suspicious. Twelve links: flagged. Every link is a potential spam signal — especially if any of them point to domains with poor reputation. And yes, link shorteners (bit.ly, etc.) are almost universally flagged now. Use your own domain for tracking or don't use link shorteners at all.

### 15. The Unsubscribe Link Is Missing (or Broken)

This one cuts both ways. Missing an unsubscribe link in commercial email is a CAN-SPAM violation AND a spam signal. But here's the nuance: for cold B2B email (genuine one-to-one outreach), a formal unsubscribe link can actually make your email look more like mass marketing, which triggers different filters. The right call depends on volume and context — but if you're sending sequences to lists over 500 people, you need one.

---

## Category 4: Sending Behavior Signals

How you send matters as much as what you send.

### 16. Sending Too Many Emails Too Fast

Volume spikes are one of the most reliable spam signals. If your domain normally sends 50 emails a day and you blast 2,000 on Monday, expect filtering. Throttle your sends. Use sending limits. This is one of the reasons Cleanmails has built-in sending rate controls per mailbox — so you don't accidentally nuke your own deliverability during a big campaign push.

### 17. No Sending Schedule (Emailing at 3am)

Legitimate business email follows patterns — mostly sent during business hours in the sender's timezone. Emails blasting out at 3am Saturday are a behavioral flag. Schedule your sends for business hours, and stagger them to avoid identical send timestamps across hundreds of recipients.

### 18. Identical Message Content Sent to Everyone

Sending the exact same email to 500 people is a fingerprinting problem. Spam filters hash email content. When they see 500 identical hashes coming from the same IP in an hour, they don't need to read the content to know something's wrong. Personalization isn't just good practice — it's a deliverability requirement at scale.

---

## Category 5: Reputation & Engagement Signals

### 19. High Spam Complaint Rate

If recipients are hitting "Report Spam" on your emails, Google and Microsoft are watching. Gmail's Postmaster Tools gives you visibility into your complaint rate. Above 0.1% is a warning zone. Above 0.3% and you'll start seeing systemic filtering. The fix here is upstream: better targeting, better copy, and warming up properly. [This deep dive into why cold emails land in spam](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication) covers the authentication side of this in detail.

### 20. Your IP Is on a Blacklist

This one seems obvious, but I'm constantly surprised by how many senders don't check. Shared IPs (from ESPs, shared hosting, etc.) can get blacklisted because of someone else's behavior. Dedicated IPs can get blacklisted if you've been sending poorly. Check your IP against major blacklists — the [SPF/DKIM/DMARC Checker](/tools/dns-checker) will surface blacklist status alongside your authentication records.

---

## The 30-Minute Fix: Where to Start

If you've just read through this list and you're not sure where to start, here's the priority order:

| Priority | Issue | Time to Fix |
|----------|-------|-------------|
| 1 | SPF/DKIM/DMARC | 15 minutes |
| 2 | Verify your list | 10 minutes |
| 3 | Check IP blacklists | 5 minutes |
| 4 | Audit subject lines | 10 minutes |
| 5 | Check sending volume | 5 minutes |

Do those five things before your next send. Seriously. The rest can follow.

---

## One More Thing

I want to be direct about something: most deliverability problems are self-inflicted. Spam filters aren't trying to catch you — they're trying to protect inboxes. When your emails look like spam (behaviorally, technically, or content-wise), they get treated like spam.

The senders who consistently hit the inbox aren't doing anything magical. They're just not making the 20 mistakes above. Fix your infrastructure, clean your lists, write like a human, and send at a pace that looks like a real business. That's the whole game.

For the weekly habit of keeping this in check, the [cold email health check](/blog/weekly-cold-email-health-check-review) is worth bookmarking — it's a Monday morning routine that catches most of these issues before they compound.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [Why 93% of Cold Emails Never Get Opened (And How to Fix It)](/blog/why-93-percent-cold-emails-never-get-opened)
- [How to Write Cold Email Copy That Passes the 'Would I Reply?' Test](/blog/write-cold-email-copy-reply-test)
- 🛠️ Tool: [Email Spam Word Checker](/tools/spam-checker)