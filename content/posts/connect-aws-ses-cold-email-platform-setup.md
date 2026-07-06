---
title: "How to Connect AWS SES to Your Cold Email Platform (Step-by-Step)"
slug: "connect-aws-ses-cold-email-platform-setup"
date: "2026-07-06"
author: "Cleanmails"
tags: ["AWS SES", "SMTP Setup", "Infrastructure", "Cold Email", "Email Deliverability"]
category: "Infrastructure"
coverImage: "https://images.pexels.com/photos/2528324/pexels-photo-2528324.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Fluffy white clouds against a vibrant blue sky create a dramatic cloudscape."
excerpt: "AWS SES gives you enterprise-grade deliverability at fractions of a cent per email — but most people set it up wrong and wonder why they're still landing in spam. Here's the exact process to connect AWS SES to your cold email platform correctly."
readTime: "10 min read"
photographerName: "Lisa from Pexels"
photographerUrl: "https://www.pexels.com/@fotios-photos"
---

Most people pay $0.10–$0.30 per email to tools that throttle their sending, own their data, and can shut them down overnight. AWS SES charges $0.0001 per email. That's not a typo — it's 1,000x cheaper, and the deliverability is better if you set it up right.

If you've been trying to **connect AWS SES to your cold email** platform and running into walls — sandbox mode, SMTP authentication errors, or mysterious bounce rates — this guide will fix all of it. I've set this up across dozens of domains and I'll walk you through every step, including the parts the AWS documentation conveniently glosses over.

---

## Why AWS SES for Cold Email (And One Big Caveat)

Here's the counterintuitive truth: AWS SES is not beginner-friendly, but that's exactly why it's good. The friction filters out spammers. AWS actively monitors sending reputation, enforces bounce and complaint thresholds, and requires you to prove you're a legitimate sender before granting production access.

The result? Their IP pool is cleaner than most ESP shared pools, and your emails ride on infrastructure used by companies like Reddit, Netflix, and Airbnb.

**The caveat:** AWS SES is transactional infrastructure. It's not a cold email platform by itself — it has no cadences, no sender rotation, no list management, no reply tracking. You need to pair it with a platform that can handle all that. More on this later.

**SES pricing breakdown:**
- $0.10 per 1,000 emails sent
- $0.12 per GB of attachments
- Free tier: 62,000 emails/month if sending from EC2

For context, sending 100,000 emails/month costs you $10. The same volume on Instantly or Smartlead at scale can run $300–$500+/month. If you want to understand the full math on why subscription tools destroy ROI at scale, read [why monthly cold email subscriptions are killing your ROI](/blog/why-monthly-cold-email-subscriptions-are-killing-your-roi).

---

## Before You Start: What You Actually Need

Before touching AWS, get these ready:

- An AWS account (free to create)
- A domain you control with DNS access
- A cold email platform that accepts external SMTP credentials
- Your domain's SPF, DKIM, and DMARC records set up — if you haven't done this, stop here and follow [this 10-minute DNS authentication guide](/blog/spf-dkim-dmarc-setup-tutorial) first. Skipping this step is why most people see 40%+ spam placement even with SES.

---

## Step 1: Set Up Your AWS SES Identity (Domain Verification)

1. Log into your AWS Console and navigate to **Amazon SES** (search for it in the top bar)
2. In the left sidebar, click **Verified Identities** → **Create Identity**
3. Select **Domain** (not email address — domain-level verification is more powerful)
4. Enter your sending domain (e.g., `outreach.yourdomain.com`)
5. Enable **Easy DKIM** — select RSA-2048 for stronger authentication
6. Click **Create Identity**

AWS will generate 3 CNAME records. Add these to your DNS provider (Cloudflare, Route 53, Namecheap, wherever).

```
Name: abc123._domainkey.outreach.yourdomain.com
Type: CNAME
Value: abc123.dkim.amazonses.com
```

Do this for all three records. DNS propagation takes 5–30 minutes. Once verified, you'll see a green **Verified** badge in the SES console.

> **Pro tip:** Use a subdomain for cold email (`outreach.yourdomain.com`, `mail.yourdomain.com`) rather than your root domain. This isolates your sending reputation from your main domain. If something goes wrong, your root domain stays clean.

---

## Step 2: Request Production Access (Get Out of Sandbox)

This is where most people get stuck. By default, SES puts you in **sandbox mode**, which means:
- You can only send to verified email addresses
- You're capped at 200 emails/day
- Useless for cold email

To request production access:

1. In SES console, go to **Account Dashboard**
2. Click **Request Production Access**
3. Fill out the form — this is important, don't rush it

**What to write in the use case description (this is what gets you approved fast):**

```
We send B2B outreach emails to prospects who have publicly listed 
their business contact information. We maintain strict list hygiene 
using email verification before sending, monitor bounce rates 
(targeting <2%) and complaint rates (<0.1%), and include clear 
unsubscribe mechanisms in all emails. We send approximately 
[X] emails per day to business professionals.
```

AWS reviews these manually. Be specific. Vague answers like "marketing emails" get rejected. Approvals typically come within 24–48 hours. I've had same-day approvals with detailed use case descriptions.

**Production limits after approval:**
- Default: 50,000 emails/day, 14 emails/second
- You can request increases from the same dashboard

---

## Step 3: Create SMTP Credentials

SES doesn't use your normal AWS login for SMTP. You need dedicated SMTP credentials.

1. In SES Console → **SMTP Settings** (left sidebar)
2. Note your **SMTP endpoint** — it looks like `email-smtp.us-east-1.amazonaws.com` (varies by region)
3. Click **Create SMTP Credentials**
4. Give the IAM user a name (e.g., `ses-smtp-coldmail`)
5. Click **Create** → **Download Credentials**

**Save this file immediately.** AWS shows the SMTP password exactly once. If you lose it, you have to create new credentials.

Your SMTP settings will look like this:

| Setting | Value |
|---|---|
| SMTP Server | email-smtp.us-east-1.amazonaws.com |
| Port | 587 (TLS) or 465 (SSL) |
| Username | AKIAIOSFODNN7EXAMPLE (your SMTP username) |
| Password | wJalrXUtnFEMI/K7MDENG (your SMTP password) |
| Encryption | STARTTLS |

> **Port note:** Use port 587 with STARTTLS. Port 25 is often blocked by ISPs and AWS itself restricts it by default. If you want to understand why port selection matters for deliverability, [this guide on Port 25 and cold email infrastructure](/blog/port-25-cold-email-vps-guide) explains the full picture.

---

## Step 4: Connect AWS SES SMTP to Your Cold Email Platform

This is where you plug SES into whatever you're using to run campaigns.

### Connecting to Cleanmails

If you're using [Cleanmails](https://cleanmails.com) (which has inbuilt SMTP but also accepts external SMTP connections), the process is straightforward:

1. Go to **Settings → Email Accounts → Add Account**
2. Select **Custom SMTP**
3. Enter your SES SMTP credentials from Step 3
4. Set the from address to a verified identity on your SES domain
5. Send a test email — you should see it delivered within seconds

What makes this pairing powerful: Cleanmails handles sender rotation across multiple SES accounts/regions automatically. You can add SES credentials from `us-east-1`, `us-west-2`, and `eu-west-1` as separate SMTP accounts and rotate sends across all three. This distributes your sending volume and protects any single region's reputation.

### Connecting to Other Platforms

For any platform that accepts external SMTP:
- **Instantly/Smartlead:** Go to email account settings → custom SMTP → enter credentials above
- **Lemlist:** Workspace settings → email providers → SMTP
- **n8n/Make automations:** Use the SMTP node with the same credentials

---

## Step 5: Configure Bounce and Complaint Handling (Don't Skip This)

This is the step 90% of tutorials skip, and it's why people get their SES accounts suspended.

AWS SES has hard limits:
- **Bounce rate > 5%:** Account review
- **Bounce rate > 10%:** Account suspension
- **Complaint rate > 0.1%:** Account review
- **Complaint rate > 0.5%:** Account suspension

You need to set up SNS (Simple Notification Service) to handle bounce and complaint notifications:

1. In SES → **Email Sending** → **Configuration Sets** → **Create Configuration Set**
2. Add an **Event Destination** → Select **SNS**
3. Create a new SNS topic, subscribe your endpoint (a webhook URL from your cold email platform)
4. Select events: **Bounces** and **Complaints**

Alternatively, set up an SQS queue to collect bounces and process them in batches. Most serious cold email operators use this to automatically suppress bounced addresses.

**Before you send anything:** Clean your list. Use the [Bulk Email Verifier](/tools/email-verifier) to remove invalid addresses before they become bounces. Getting your bounce rate under 2% isn't about luck — it's about not sending to bad addresses in the first place.

---

## Step 6: Set Up Sending Limits and Warm Up Properly

Even with production access, don't blast 50,000 emails on day one. SES monitors sending patterns and a sudden spike looks like a compromised account.

**My recommended SES warm-up schedule:**

| Day | Daily Volume | Hourly Rate |
|---|---|---|
| 1–3 | 200–500 | 20–40/hr |
| 4–7 | 500–2,000 | 100–200/hr |
| 8–14 | 2,000–10,000 | 500–800/hr |
| 15–30 | 10,000–30,000 | 1,000–2,000/hr |

If you're managing multiple mailboxes through SES simultaneously, the sender rotation strategy becomes critical — [this deep-dive on SMTP rotation at scale](/blog/smtp-rotation-explained) shows exactly how to distribute volume without triggering rate limits.

---

## Step 7: Test Everything Before Going Live

Run this checklist before sending your first real campaign:

- [ ] Domain shows **Verified** in SES console
- [ ] DKIM records are live (check with [SPF/DKIM/DMARC Checker](/tools/dns-checker))
- [ ] Production access granted (not sandbox)
- [ ] Bounce/complaint notifications configured via SNS
- [ ] Test email sent and received in inbox (not spam)
- [ ] List cleaned through email verifier
- [ ] Sending rate configured below SES limits

For the test email, send to a Gmail, an Outlook, and a Yahoo address. Check headers to confirm DKIM is signing properly. If any land in spam, run your copy through the [Email Spam Word Checker](/tools/spam-checker) — sometimes it's the content, not the infrastructure.

---

## The Multi-Region Strategy (Advanced)

Here's something most guides won't tell you: you can use SES across multiple AWS regions and they maintain **separate sending reputations**.

This means:
- `us-east-1` reputation is independent of `eu-west-1`
- You can have 50,000 emails/day per region
- If one region gets dinged, others keep running

For high-volume senders, I run separate SES configurations in at least two regions and route traffic based on recipient geography (EU prospects through EU region, US through US-East). It improves deliverability and gives you a backup if one region has issues.

This is the same principle behind [scaling cold email without monthly fees](/blog/scaling-cold-email-without-monthly-fees) — you own the infrastructure, you control the redundancy.

---

## Common Errors and Fixes

**"Email address not verified"**
You're in sandbox mode sending to an unverified address. Either verify the recipient or get production access.

**"Daily sending quota exceeded"**
You've hit your daily limit. Request a quota increase in SES → Account Dashboard → Edit sending limits.

**535 Authentication Credentials Invalid**
Your SMTP username/password is wrong. Remember: SES SMTP credentials are NOT your AWS account credentials. Regenerate SMTP credentials in the SMTP Settings page.

**Emails landing in spam despite valid authentication**
Authentication is passing but content is triggering filters. Check your email copy, remove spam trigger words, verify you have a plain-text version, and ensure your unsubscribe link works.

---

## Bottom Line

Connecting AWS SES to your cold email platform takes about 2–3 hours to set up properly, but once it's running, you've got enterprise-grade infrastructure for essentially nothing. The setup cost is time, not money. The ongoing cost is fractions of a cent per email.

The people who fail with SES skip the bounce handling, rush the warm-up, or use their root domain instead of a subdomain. Don't be those people. Follow the steps above in order and you'll have a system that's more reliable and more affordable than anything a SaaS platform is selling you.

---

## Related:

- [SMTP Rotation: How to Send at Scale Without Getting Blacklisted](/blog/smtp-rotation-explained)
- [Scaling Cold Email Without Monthly Fees: A Guide to Infrastructure Control](/blog/scaling-cold-email-without-monthly-fees)
- [How to Set Up SPF, DKIM, and DMARC in Under 10 Minutes](/blog/spf-dkim-dmarc-setup-tutorial)
- 🔧 Tool: [SPF/DKIM/DMARC Checker — Verify Your DNS Records](/tools/dns-checker)