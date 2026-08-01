---
title: "The Email Deliverability Checklist I Run Before Every Campaign"
slug: "email-deliverability-checklist-template"
date: "2026-05-21"
author: "Cleanmails"
tags: ["Deliverability", "Cold Email", "SMTP", "Email Authentication", "Checklist"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/6289028/pexels-photo-6289028.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Vector illustration of modern tablet with check marks placed near dollar banknotes and credit card"
excerpt: "Most cold email campaigns fail before a single word gets read — because of setup errors you could fix in 30 minutes. Here's the exact email deliverability checklist I run before every campaign."
readTime: "9 min read"
photographerName: "Monstera Production"
photographerUrl: "https://www.pexels.com/@gabby-k"
---

Most cold email campaigns are dead on arrival — not because the copy is bad, but because the infrastructure was never set up to deliver. I've audited dozens of outreach setups and the same preventable mistakes show up every single time.

This is the **email deliverability checklist template** I run through before every single campaign, whether I'm sending 200 emails or 20,000. Bookmark it. Use it. Your reply rates will thank you.

---

## Why Most Deliverability Checklists Are Useless

Here's a take most people won't say out loud: 90% of the "email deliverability advice" online is either outdated or written by people who've never actually managed a cold email infrastructure at scale.

They'll tell you to "warm up your domain" and "avoid spam words" and call it a day. That's like telling someone to buckle their seatbelt while ignoring the fact that their brakes are missing.

Real deliverability comes down to three layers:
1. **Authentication** — does the receiving server trust you?
2. **Reputation** — does your sending history suggest you're legit?
3. **Content** — does the email itself look like something a human wrote?

All three have to be right. One weak layer tanks the whole campaign. Let's go through each.

---

## The Full Email Deliverability Checklist Template

### ✅ Layer 1: Domain & DNS Authentication

This is non-negotiable. If your authentication records are broken or missing, nothing else matters — you will land in spam or get rejected outright.

**1. SPF Record — Is it set up and valid?**

Your SPF record tells receiving mail servers which IPs are authorized to send on behalf of your domain. A misconfigured SPF is one of the most common reasons cold emails fail silently.

Check it looks something like this:
```
v=spf1 include:yourmailprovider.com ~all
```

Red flags:
- More than 10 DNS lookups (causes SPF permerror)
- Using `-all` when you're still testing (causes hard failures)
- Missing entirely

Use our free [SPF/DKIM/DMARC Checker](/tools/dns-checker) to verify your records in under 60 seconds.

**2. DKIM — Is it signing outbound mail?**

DKIM adds a cryptographic signature to every email you send. Without it, receiving servers have no way to verify the message wasn't tampered with in transit. Many ESPs set this up automatically, but if you're running your own SMTP, you need to configure it manually.

Check: send a test email to `check-auth@verifier.port25.com` — you'll get a full authentication report back.

**3. DMARC — Is it configured with at least a monitoring policy?**

DMARC ties SPF and DKIM together and tells receiving servers what to do when something fails. A surprising number of senders skip this entirely — and Google and Yahoo's 2024 sender requirements now mandate it for bulk senders.

Minimum viable DMARC:
```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

For a deeper walkthrough of setting all three up, read [How to Set Up SPF, DKIM, and DMARC in Under 10 Minutes](/blog/spf-dkim-dmarc-setup-tutorial).

**4. Custom Tracking Domain — Are you using one?**

If you're using click tracking, the tracking links need to be on *your* domain, not a shared domain from your ESP. Shared tracking domains get blacklisted constantly. Set up a CNAME subdomain like `track.yourdomain.com` and point it to your ESP's tracking server.

**5. Is your sending domain different from your main domain?**

This one is critical and most beginners get it wrong. Never cold email from your primary business domain. Use a subdomain or a separate domain (e.g., `trycompanyname.com` or `get-companyname.com`). If it gets flagged, your main domain stays clean.

---

### ✅ Layer 2: Sending Infrastructure & Reputation

**6. Is your sending IP warm?**

New IPs have zero reputation — and that's almost as bad as a negative one. Warm up gradually: start with 20-30 emails/day per inbox, increase by ~20% daily over 2-4 weeks. Don't skip this even if you're in a hurry.

**7. Is your IP (or domain) on any blacklists?**

Check MXToolbox or use our [SPF/DKIM/DMARC Checker](/tools/dns-checker) which also surfaces common blacklist hits. Being on even a minor blacklist can tank your deliverability with certain ISPs.

**8. Are you rotating senders properly?**

This is the single biggest infrastructure lever most people ignore. Sending all volume through one inbox is how you get flagged. Distribute load across multiple sending addresses.

The rule of thumb I use: **no more than 40-50 cold emails per inbox per day**. If you need to send 500 emails/day, that's 10-12 inboxes minimum.

For the full strategy on this, see [The Sender Rotation Strategy That Keeps You Out of Spam Forever](/blog/sender-rotation-strategy-stay-out-of-spam) — and [Optimizing Cold Email Sender Rotation for High-Volume Outreach](/blog/optimizing-cold-email-sender-rotation-for-high-volume-outreach) if you're running serious volume.

Cleanmails handles sender rotation natively — you can add multiple SMTP accounts and it automatically distributes sends across them without you having to manually manage it.

**9. Is your sending cadence spaced out?**

Batch sending 500 emails in 10 minutes looks like a spam blast to every filter on the planet. Use time delays between sends — minimum 90-120 seconds between emails, ideally with some randomization (e.g., 90-180 seconds).

**10. Have you checked your sender score recently?**

SenderScore.org gives you a 0-100 reputation rating for your sending IP. Anything below 70 is a problem. Below 50 and you're probably already in the junk folder.

---

### ✅ Layer 3: List Quality

Here's the counterintuitive insight most people miss: **your list hygiene has more impact on deliverability than your email copy.** A clean list of 1,000 people will outperform a dirty list of 10,000 every single time — because bounce rates and spam complaints directly damage your sender reputation.

**11. Have you validated your list recently?**

Email lists decay at roughly 22% per year. If you haven't touched a list in 6 months, expect a significant chunk of those addresses to be dead. Hard bounces above 2% will get your account flagged or suspended by most providers.

Run your list through our free [Bulk Email Verifier](/tools/email-verifier) before every campaign. It checks for:
- Syntax errors
- Disposable/temporary email addresses
- Domain MX records (does the domain even accept email?)
- SMTP-level verification (is the mailbox active?)

**12. Have you removed previous hard bounces and unsubscribes?**

This seems obvious but I've seen experienced marketers forget it. Maintain a global suppression list and scrub against it before every send. One campaign's bounces are the next campaign's deliverability bomb.

**13. Is your list segmented properly?**

Don't send the same email to everyone. Segment by industry, company size, or persona at minimum. Relevance reduces spam complaints, and spam complaints are the fastest way to destroy a sender reputation.

**14. Have you cleaned your CSV for formatting issues?**

Bad data causes bad personalization, which causes people to mark you as spam. Run your list through our [CSV Email List Cleaner](/tools/csv-cleaner) to catch duplicate entries, weird character encoding, and malformed email fields.

---

### ✅ Layer 4: Email Content

**15. Run it through a spam word checker**

Certain words and phrases trigger content filters. "Free," "guaranteed," "act now," "no risk" — these are obvious ones. But filters have gotten more sophisticated. They look at phrase combinations, HTML structure, and text-to-image ratios.

Run your email through our [Email Spam Word Checker](/tools/spam-checker) before you finalize copy.

**16. Is your HTML clean (or are you using plain text)?**

Plain text emails almost always outperform HTML in cold outreach. They look like personal emails. They load instantly. They don't have broken image tags or nested table code that spam filters hate.

If you're using HTML, keep it minimal. No background images. No more than 1-2 links. Text-to-HTML ratio should be high.

**17. Is every email slightly different (spintax or manual variation)?**

Sending the exact same email body 500 times is a pattern spam filters recognize. Use spintax to vary subject lines, openers, and CTAs. Even small variations make a measurable difference. For a proven approach to this, read [The Spintax Strategy That 10x'd My Reply Rate Overnight](/blog/spintax-cold-email-strategy).

**18. Does your email have a clear, easy unsubscribe path?**

This is both a legal requirement (CAN-SPAM, GDPR) and a deliverability best practice. If people can't unsubscribe easily, they mark you as spam instead. A spam complaint costs you far more than an unsubscribe.

**19. Is your From name and subject line consistent with the email body?**

Mismatched sender names, deceptive subject lines, and bait-and-switch content are spam signals. Your From name should look like a real person (`James from Acme` not `Acme Sales Team`), and your subject line should reflect what's actually in the email.

For more on writing copy that doesn't trigger filters *or* human skepticism, see [How to Write Cold Emails That Don't Sound Like Cold Emails](/blog/natural-sounding-cold-email-writing-guide).

---

## The Pre-Send 30-Minute Audit (Quick Reference Table)

| Check | Tool | Time |  
|---|---|---|
| SPF/DKIM/DMARC valid | [DNS Checker](/tools/dns-checker) | 3 min |
| IP not blacklisted | MXToolbox / DNS Checker | 2 min |
| List validated | [Email Verifier](/tools/email-verifier) | 10 min |
| CSV cleaned | [CSV Cleaner](/tools/csv-cleaner) | 5 min |
| Spam words checked | [Spam Checker](/tools/spam-checker) | 3 min |
| Sender rotation configured | Cleanmails / SMTP settings | 5 min |
| Sending limits set (≤50/day/inbox) | Campaign settings | 2 min |

---

## One Final Thing Most People Skip

Send a test email to a Gmail, Outlook, and Apple Mail account you control before launching. Open the email. Check the headers. See where it landed.

If it hits the Promotions tab in Gmail, you're not in spam — but you're not in Primary either. Tweak the content to look less like a newsletter. If it lands in spam, stop everything and work through this checklist again before sending a single live email.

Deliverability isn't a set-and-forget thing. It's an ongoing discipline. Run this checklist before every campaign, not just the first one.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [Why 93% of Cold Emails Never Get Opened (And How to Fix It)](/blog/why-93-percent-cold-emails-never-get-opened)
- [The Sender Rotation Strategy That Keeps You Out of Spam Forever](/blog/sender-rotation-strategy-stay-out-of-spam)
- 🛠 Tool: [SPF/DKIM/DMARC Checker](/tools/dns-checker)
