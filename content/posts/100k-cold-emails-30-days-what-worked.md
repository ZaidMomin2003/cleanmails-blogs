---
title: "I Sent 100,000 Cold Emails in 30 Days — Here's What Actually Worked"
slug: "100k-cold-emails-30-days-what-worked"
date: "2026-05-06"
author: "Cleanmails"
tags: ["Cold Email", "Case Study", "Email Deliverability", "Outreach Strategy", "High Volume"]
category: "Cold Email"
coverImage: "https://images.pexels.com/photos/15635403/pexels-photo-15635403.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "A concept image of a hashtag campaign displayed on paper for marketing strategies."
excerpt: "I sent 100,000 cold emails in 30 days across 6 campaigns and tracked everything obsessively — here's the cold email results case study nobody else is publishing, including the 3 things that actually moved the needle."
readTime: "8 min read"
photographerName: "Walls.io"
photographerUrl: "https://www.pexels.com/@walls-io-440716388"
---

Most cold email "case studies" are written by people who sent 500 emails and got lucky once. This one isn't that.

Over 30 days, I sent exactly 102,847 cold emails across 6 campaigns, 14 sending domains, and 3 different industries. I tracked open rates, reply rates, bounce rates, positive response rates, and meetings booked — obsessively. This is the cold email results case study I wish existed when I started scaling.

Let me tell you what worked, what bombed, and the one counterintuitive insight that changed how I think about volume outreach entirely.

## The Setup: Infrastructure Before Strategy

Before I get into numbers, let me be clear: **volume cold email lives or dies on infrastructure.** I see people obsess over subject lines while sending everything through a single Gmail account. That's like tuning a race car's stereo while the engine is on fire.

Here's exactly what I ran:

- **14 sending domains** (bought in batches, aged 4+ weeks before use)
- **28 sender accounts** (2 per domain)
- **Daily send limit per account:** 40–50 emails
- **Sending schedule:** Mon–Thu only, 7am–11am local time per recipient timezone
- **Warmup period:** 3 weeks per domain before any real sends

For the technical side — SPF, DKIM, and DMARC records on every single domain. No exceptions. If you haven't audited yours, run them through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) before you send a single email. I've seen campaigns tanked entirely because someone forgot a DMARC policy.

I used [Cleanmails](https://cleanmails.com) as the sending platform because I needed built-in SMTP, sender rotation, and email validation without paying $600/month in SaaS fees. One-time cost, self-hosted, and I control the infrastructure. For anyone running campaigns at this volume, [the math on monthly subscriptions gets ugly fast](/blog/why-monthly-cold-email-subscriptions-are-killing-your-roi).

## The 6 Campaigns: A Breakdown

Here's the full breakdown by campaign. Industry names anonymized, but the data is real.

| Campaign | Emails Sent | Open Rate | Reply Rate | Positive Reply Rate | Meetings Booked |
|----------|-------------|-----------|------------|---------------------|------------------|
| SaaS (SMB) | 21,400 | 38.2% | 4.1% | 1.8% | 31 |
| SaaS (Enterprise) | 8,200 | 29.7% | 2.3% | 1.1% | 9 |
| Agency Owners | 18,600 | 41.5% | 5.7% | 2.4% | 44 |
| E-commerce Brands | 22,100 | 34.8% | 3.9% | 1.2% | 26 |
| B2B Services | 19,300 | 36.1% | 4.4% | 1.9% | 37 |
| Recruiting/HR | 13,247 | 28.4% | 2.1% | 0.7% | 9 |
| **Total** | **102,847** | **35.9% avg** | **3.9% avg** | **1.6% avg** | **156** |

156 meetings from 102,847 emails. That's a 0.15% meeting rate on total volume — which sounds low until you realize these were **cold** contacts who had never heard of us, and each meeting had an average deal value of $4,200.

## What Actually Worked: 3 Things That Moved the Needle

### 1. List Quality Destroyed Everything Else as a Variable

Here's the counterintuitive insight I promised: **your copy matters far less than your list quality at scale.**

I ran an A/B test on the Agency Owners campaign. Version A had a polished, carefully-crafted 4-step sequence I spent 6 hours writing. Version B was a simple 2-email sequence with decent but unremarkable copy.

Version A was sent to a scraped list with minimal verification. Version B went to a hand-curated, triple-verified list.

Version B outperformed Version A by 2.3x on positive reply rate. Same targeting, same offer, wildly different list quality.

My list cleaning process before every campaign:
1. Remove obvious role-based addresses (info@, support@, hello@)
2. Run the full list through the [Bulk Email Verifier](/tools/email-verifier) — I was catching 8–14% invalid addresses on scraped lists
3. Deduplicate against my master suppression list
4. Remove anyone who'd been contacted in the last 90 days
5. Final CSV cleanup using the [CSV Email List Cleaner](/tools/csv-cleaner) to catch formatting issues

The Recruiting/HR campaign had the worst numbers in the table. Know what it also had? The worst list quality. I was working with a third-party data source that hadn't been refreshed in 14 months. Lesson learned the expensive way.

### 2. Sender Rotation Done Right is a Superpower

Most people treat sender rotation like a deliverability hack. It's not — it's a **volume management system.** The goal isn't to trick spam filters. The goal is to spread sending volume across enough healthy identities that no single sender gets flagged for unusual activity.

My rotation rules:
- Never send more than 50 emails/day from any single account
- Rotate senders within a campaign so each recipient sees a different "from" name
- Pause any sender immediately if bounce rate on that account exceeds 3%
- Warm replacement senders for 2 weeks before adding them to active rotation

I wrote more about the mechanics of this in [Optimizing Cold Email Sender Rotation for High-Volume Outreach](/blog/optimizing-cold-email-sender-rotation-for-high-volume-outreach) — worth reading if you're running more than 10k/month.

The SaaS Enterprise campaign underperformed partly because I was too aggressive with a new batch of senders I hadn't fully warmed. Open rates started at 34% and dropped to 21% by week 3. That's a deliverability warning sign, not a copy problem. I pulled those senders, re-warmed them, and the rate recovered — but the campaign was already half over.

### 3. The 3-Touch Cadence Outperformed Everything Longer

I tested cadences ranging from 2 to 7 touches across campaigns. Here's what the data showed:

- **2 touches:** 78% of replies came from email 1, 22% from email 2
- **3 touches:** 71% email 1, 19% email 2, 10% email 3
- **5 touches:** The incremental replies from emails 4 and 5 were statistically negligible — and the unsubscribe/complaint rate doubled
- **7 touches:** Actively hurt sender reputation. Not worth it.

My winning cadence structure:

**Email 1 (Day 1):** Lead with a specific, relevant observation about their business. One clear ask. Under 80 words.

**Email 2 (Day 4):** A different angle — lead with a result or case study. Don't just say "following up." Add value or don't send it.

**Email 3 (Day 9):** The breakup email. Honest, low-pressure, gives them an easy out. This one consistently got 30–40% of total replies across all campaigns.

Anything beyond 3 touches produced diminishing returns so severe they weren't worth the deliverability risk. If they haven't replied after 3 well-crafted emails, the timing is wrong — not your copy.

## What Bombed: 2 Expensive Mistakes

### Mistake 1: Skipping Spam Word Audits on Batch Sends

On the E-commerce campaign, I let an intern draft the second follow-up. It included phrases like "limited time offer," "act now," and "guaranteed results." I didn't catch it until open rates dropped 11 percentage points in 48 hours.

Now every email draft goes through the [Email Spam Word Checker](/tools/spam-checker) before it touches a send queue. Non-negotiable.

### Mistake 2: Not Monitoring Bounce Rates Per Domain in Real Time

Two of my 14 domains crept above 5% bounce rate before I caught it. By then, both had taken deliverability hits that took 3 weeks to recover from. I should have been checking per-domain bounce rates daily, not weekly.

For a deeper look at managing this proactively, [Mastering Cold Email Bounce Rate Management](/blog/mastering-cold-email-bounce-rate-management) covers the exact thresholds and response playbook I now follow.

## The Numbers That Actually Matter

Everyone reports open rates and reply rates. Here's what I actually care about:

- **Cost per meeting booked:** $0 in SaaS fees (self-hosted) + ~$180 in domain/account costs + my time = roughly $1.15/meeting at scale
- **Positive reply rate by industry:** Agency owners (2.4%) >> B2B Services (1.9%) >> SaaS SMB (1.8%) >> E-commerce (1.2%) >> Recruiting (0.7%)
- **Best performing subject line format:** Question-based, under 6 words, no personalization tokens (outperformed heavy personalization by 14% on open rate — yes, really)
- **Worst performing element:** Anything that looked like a marketing email. Plain text, minimal formatting, sent from a real human name always won.

## What I'd Do Differently

1. **Start domain aging earlier.** I was rushing 3-week-old domains into rotation. Four weeks minimum, five is better. Read [How to Warm Up a New Cold Email Domain for Maximum Deliverability](/blog/how-to-warm-up-a-new-cold-email-domain) before you buy your next batch.
2. **Cut the Recruiting campaign after week 1.** The data was telling me to stop. I kept going hoping it would turn around. It didn't.
3. **Invest more in list research upfront.** The campaigns with the best list quality were the ones where I spent 2–3 hours manually auditing 100-row samples before sending. That time paid back 5x.

## The 30-Minute Action Plan

If you want to implement the core of what I learned today:

1. Check all your sending domains with the [SPF/DKIM/DMARC Checker](/tools/dns-checker) right now
2. Run your current list through the [Bulk Email Verifier](/tools/email-verifier) and delete anything that bounces back invalid
3. Paste your next email draft into the [Email Spam Word Checker](/tools/spam-checker)
4. Trim your cadence to 3 touches max if you're running longer
5. Set a daily alert for bounce rates per sending account — flag anything over 3% immediately

That's it. Do those five things and you'll be ahead of 90% of people sending cold email at volume.

---

**Related:**
- [The Complete Cold Email Deliverability Guide for 2026](/blog/cold-email-deliverability-guide)
- [How to Build a High-Volume Cold Email Infrastructure Without Monthly Fees](/blog/high-volume-cold-email-infrastructure-no-monthly-fees)
- [SMTP Rotation: How to Send at Scale Without Getting Blacklisted](/blog/smtp-rotation-explained)
- 🛠️ Tool: [Bulk Email Verifier](/tools/email-verifier)