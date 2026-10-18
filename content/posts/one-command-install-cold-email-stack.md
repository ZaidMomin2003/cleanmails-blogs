---
title: "The One-Command Install That Sets Up Your Entire Cold Email Stack"
slug: "one-command-install-cold-email-stack"
date: "2026-10-18"
author: "Cleanmails"
tags: ["cold email", "self-hosted", "setup guide", "SMTP", "email infrastructure"]
category: "Guides"
coverImage: "https://images.pexels.com/photos/4657267/pexels-photo-4657267.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "From below of long thin identical blue cables connected to small round electrical connectors"
excerpt: "Most cold email stacks take days to wire together — five tools, three subscriptions, and a Zapier nightmare. Here's how to collapse the entire thing into a single command."
readTime: "8 min read"
photographerName: "Brett Sayles"
photographerUrl: "https://www.pexels.com/@brett-sayles"
---

Most cold email stacks are a disaster of duct tape. You've got one tool for sending, another for validation, a third for tracking, and a fourth for managing sequences — all talking to each other through webhooks that break at 2am on a Tuesday. I've been there. The one-command install cold email stack isn't a fantasy — it's how serious operators are building now.

Let me show you exactly how to do it.

## Why Your Current Stack Is Costing You More Than You Think

Here's a number that should bother you: the average cold email operator running a modest 10,000 email/month operation pays between $400–$700/month across fragmented SaaS tools. Instantly, Smartlead, or Apollo for sending. NeverBounce or ZeroBounce for validation. Mailgun or SendGrid for SMTP. And then whatever you're using to glue it all together.

That's $5,000–$8,000 per year for infrastructure you don't own, can't customize, and that can suspend your account without warning.

The contrarian take: **the multi-tool stack is not a sign of sophistication — it's a sign of vendor lock-in masquerading as flexibility.**

The better operators I know have moved to self-hosted, consolidated stacks. One server. One install. Everything under their control.

## What a Complete Cold Email Stack Actually Needs

Before we get to the command, let's be precise about what "complete" means. A production-ready cold email stack needs:

- **Inbuilt SMTP** — not a relay dependency. Your own mail transfer agent.
- **Email validation** — verify before you send, not after you've torched your sender reputation
- **Sender rotation** — spread volume across multiple sending accounts/domains
- **Sequence/cadence management** — multi-step follow-ups with conditional logic
- **Tracking** — opens, clicks, replies
- **Bounce and complaint handling** — automatic suppression
- **DNS authentication** — SPF, DKIM, DMARC properly configured

Most SaaS tools give you 3–4 of these. A self-hosted stack gives you all 8, permanently, for the cost of a VPS.

## Prerequisites: What You Need Before Running the Command

This isn't a "just run this and magic happens" situation. You need to do 15 minutes of prep, or the install won't matter.

### 1. A VPS with a Clean IP

Don't cheap out here. You need a provider whose IPs aren't pre-burned. My recommendations in order:

- **Hetzner** (Germany/Finland) — cheapest clean IPs, CX21 at ~€5/month is plenty for under 50k emails/month
- **Contabo** — good for heavy volume but do an IP reputation check first
- **DigitalOcean** — reliable but pricier, Droplets start at $6/month

Minimum specs: 2 vCPU, 4GB RAM, 40GB SSD. Ubuntu 22.04 LTS.

**Critical:** Before anything else, check your server IP's reputation. Run it through MXToolbox and check if it appears on any major blacklists. If it does, request a new IP or switch providers. A burned IP is unfixable no matter how good your stack is.

### 2. Your Sending Domains

You should never send cold email from your primary domain. Buy secondary domains — variations of your main brand. `getbrandname.com`, `trybrandname.com`, `brandnameapp.com` — you get the idea.

For every 30–50 emails/day, you want one domain. So if you're sending 500 emails/day, you need 10–17 sending domains.

Point each domain's MX records to your VPS before you run anything.

### 3. DNS Authentication — Non-Negotiable

This is where most DIY setups fail silently. Set up SPF, DKIM, and DMARC for every sending domain *before* you send a single email. If you skip this, you'll hit spam folders immediately regardless of your content quality — [here's a deep dive on why cold emails land in spam](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication) that covers the exact authentication chain.

Use our [SPF/DKIM/DMARC Checker](/tools/dns-checker) to verify each domain after you set records. Don't guess — confirm.

## The One-Command Install: How It Actually Works

With a self-hosted platform like [Cleanmails](https://cleanmails.com), the entire stack deploys via a single installation script onto your VPS. Here's the flow:

```bash
curl -sSL https://install.cleanmails.com | bash
```

That single command handles:

1. Dependency installation (Node.js, PostgreSQL, Redis, Postfix)
2. SMTP server configuration with your domain settings
3. Database initialization and schema migration
4. SSL certificate provisioning via Let's Encrypt
5. Email validation engine setup
6. Web UI deployment on port 443
7. Systemd service registration (auto-restart on reboot)
8. Firewall rules (UFW configured automatically)

The whole process takes 4–7 minutes on a fresh Hetzner CX21. I've run this install over a dozen times across different VPS providers — the variance is almost entirely network speed to pull packages.

### What You See After Install

When the script completes, you get output like this:

```
✓ Cleanmails installed successfully
✓ SMTP server running on port 25/587
✓ Web UI available at: https://your-server-ip
✓ Admin credentials saved to: /etc/cleanmails/.env

Next steps:
  1. Log in and configure your sending domains
  2. Add your SMTP credentials per domain
  3. Import your first contact list
  4. Create your first campaign cadence
```

You then log into the web UI (no command line required from here), add your sending domains, and you're operational within the hour.

## Post-Install Configuration: The 30-Minute Setup

The install is 7 minutes. The configuration is where you spend the rest of your time. Here's the exact sequence:

### Step 1: Add Sending Domains and Warm Them (5 minutes of setup, 2–3 weeks of patience)

In the dashboard, add each sending domain. The platform will generate DKIM keys for each one automatically — copy these into your DNS provider.

Then start warming. Do not send 500 emails/day from a fresh domain. The schedule I use:

| Week | Emails/Day Per Domain |
|------|----------------------|
| 1 | 10–20 |
| 2 | 30–50 |
| 3 | 75–100 |
| 4+ | 150–200 |

This isn't conservative — this is the actual threshold before major ESPs start applying reputation penalties.

### Step 2: Upload and Validate Your List (10 minutes)

Do not skip validation. A list with more than 3% invalid addresses will tank your sender score within two campaigns.

Use the [Bulk Email Verifier](/tools/email-verifier) before importing. Upload your CSV, let it run, download the cleaned output. For large lists (50k+), also run it through the [CSV Email List Cleaner](/tools/csv-cleaner) to strip duplicates, format issues, and obvious junk entries.

Target: under 1% invalid rate before you import. If your list is older than 6 months, expect 8–15% invalid — validate everything.

### Step 3: Configure Sender Rotation

This is where self-hosted genuinely beats SaaS. In the sending settings, you can assign multiple sender accounts to a single campaign, and the platform distributes volume across them automatically.

My default setup: 5 sending domains, 2 accounts per domain (10 total senders), capped at 40 emails/day per sender. That's 400 emails/day total from a single campaign — enough for most outbound operations without touching warm limits.

The rotation logic handles unsubscribes and bounces per-sender, so one bad address doesn't pollute your other senders' metrics.

### Step 4: Build Your Cadence

A cadence is just a sequence of emails with timing rules. The one that's worked consistently across B2B outreach:

- **Email 1:** Day 1 — Value proposition, specific to their situation
- **Email 2:** Day 3 — Different angle, shorter
- **Email 3:** Day 7 — Social proof or case study
- **Email 4:** Day 14 — The "last touch" ("Should I close your file?")

For copy guidance that actually converts, read [how to write cold email copy that passes the 'Would I Reply?' test](/blog/write-cold-email-copy-reply-test) — it's the framework I use for every new campaign.

### Step 5: Check Your Spam Score Before Launch

Before activating any cadence, paste your email copy into the [Email Spam Word Checker](/tools/spam-checker). You're looking for:

- Zero red-flag words ("guarantee", "free", "click here", "act now")
- Plain text or minimal HTML — heavy HTML increases spam likelihood by ~23%
- A single CTA, not three competing asks

## The Economics: Why This Beats SaaS Cold Email Tools

Let me be direct about the math.

A typical SaaS cold email stack at scale:
- Sending tool: $150–$300/month
- Email validation: $50–$100/month
- SMTP relay: $30–$80/month
- **Total: $230–$480/month = $2,760–$5,760/year**

Self-hosted with Cleanmails:
- One-time platform cost: $497
- VPS (Hetzner CX21): ~$60/year
- Sending domains (10): ~$120/year
- **Total year one: ~$677. Year two: ~$180.**

The break-even against a mid-tier SaaS stack is under 90 days. After that, you're operating at 96% lower infrastructure cost.

And that doesn't account for the control you gain. No account suspensions. No "your sending behavior violates our terms" emails at 6am. No per-seat pricing that scales against you as your team grows.

For a deeper breakdown of why the subscription model is structurally broken for cold email operations, see [why monthly cold email subscriptions are killing your ROI](/blog/why-monthly-cold-email-subscriptions-are-killing-your-roi).

## The One Thing Most People Get Wrong After Install

They treat the one-command install as the finish line. It's not — it's the starting line.

The install gives you infrastructure. What actually determines deliverability is the 30 days after install: consistent warming, clean lists, authenticated domains, and copy that doesn't read like it was written by a lead generation robot.

I've seen operators run the install perfectly and then immediately blast 2,000 emails from a fresh domain with no warm-up. They're back on blacklists within a week, convinced "self-hosted doesn't work." The infrastructure was fine. The operator behavior was the problem.

Self-hosted gives you control. Control requires discipline.

---

**Related:**
- [Why I Stopped Using Google Workspace for Cold Email](/blog/why-i-stopped-using-google-workspace-cold-email)
- [The Weekly Cold Email Health Check: 7 Things to Review Every Monday](/blog/weekly-cold-email-health-check-review)
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- **Tool:** [SPF/DKIM/DMARC Checker](/tools/dns-checker)