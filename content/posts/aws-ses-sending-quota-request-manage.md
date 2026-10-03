---
title: "The AWS SES Sending Quota Guide: How to Request and Manage Limits"
slug: "aws-ses-sending-quota-request-manage"
date: "2026-10-03"
author: "Cleanmails"
tags: ["AWS SES", "Email Infrastructure", "Cold Email", "SMTP", "Deliverability"]
category: "Infrastructure"
coverImage: "https://images.pexels.com/photos/17489157/pexels-photo-17489157.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Detailed view of a server rack with a focus on technology and data storage."
excerpt: "AWS SES starts you at 200 emails/day in sandbox mode — a limit that will kill your cold email campaigns before they start. Here's exactly how to request a quota increase and manage your limits like a pro."
readTime: "9 min read"
photographerName: "panumas nikhomkhai"
photographerUrl: "https://www.pexels.com/@cookiecutter"
---

Most people hit the AWS SES sandbox wall on day one and assume it's a bureaucratic nightmare to fix. It's not — but only if you know exactly what to say in your quota request and how to structure your sending setup afterward.

This is the guide I wish existed when I first moved my cold email infrastructure to SES. I've gone through this process multiple times across different AWS accounts, and I'll walk you through the AWS SES sending quota request and manage process step by step — including the specific language that gets approvals faster and the infrastructure decisions that prevent you from hitting limits again.

## Why AWS SES Limits Exist (And Why They're Actually Reasonable)

Here's the counterintuitive take: AWS SES's conservative default limits are a feature, not a bug.

SES starts every new account in **sandbox mode** with two hard limits:
- **200 emails per 24-hour period**
- **1 sending rate of 1 message per second**

And in sandbox mode, you can only send to verified email addresses. This is AWS protecting their IP reputation pool — and by extension, yours.

The surprising stat most people don't know: **AWS SES achieves delivery rates above 99%** in part *because* they aggressively gate new senders. Compare that to some shared SMTP providers where you're fighting for inbox placement against thousands of other senders on the same IP. The friction is the point.

Once you move out of sandbox, the default production limits are:
- **50,000 emails per 24-hour period**
- **14 messages per second**

For most cold email operations, that's more than enough. But if you're running multi-client agency work or high-volume sequences, you'll need to go further.

## Step 1: Move Out of SES Sandbox Mode

This is the first AWS SES sending quota request you'll make, and it's the most important one.

### How to Submit the Request

1. Log into your AWS Console
2. Navigate to **AWS Support Center** → **Create Case**
3. Select **Service limit increase**
4. Under **Limit type**, choose **SES Sending Limits**
5. Select your region (important — limits are per-region)
6. Choose **Desired Daily Sending Quota** and set your target
7. Fill in the **Use Case Description** — this is where most people fail

### The Use Case Description That Actually Works

AWS reviewers are looking for three things: legitimate use case, low expected bounce/complaint rates, and evidence you understand email best practices. Here's a template that works:

```
We are requesting production access to send [X] emails per day for 
[outbound sales / transactional notifications / marketing campaigns].

Our sending process:
- All recipients have either opted in or are verified business contacts 
  in our target market
- We validate all email addresses before sending using list cleaning tools
- We maintain an unsubscribe mechanism in every email
- We monitor bounce and complaint rates weekly and suppress invalid 
  addresses immediately
- Expected bounce rate: <2%, Expected complaint rate: <0.1%

We send from dedicated domains with SPF, DKIM, and DMARC configured. 
We are not sending bulk marketing to purchased lists.
```

Be specific. If you're doing cold email outreach, say "outbound B2B sales prospecting to verified business email addresses." Don't say "marketing." Marketing triggers extra scrutiny.

**Approval timeline:** Most requests are approved within 24-48 hours. If you get rejected, the response will tell you exactly what's missing — address it directly and resubmit.

## Step 2: Request Higher Sending Quotas

Once you're out of sandbox, managing your AWS SES sending quota is an ongoing process. Here's how to think about it.

### When to Request a Quota Increase

Don't wait until you're hitting limits. Request increases **before** you need them, ideally when you're at 60-70% of your current quota. AWS looks at your sending history when evaluating requests — a clean track record of low bounces and complaints is your best asset.

To check your current quota:
```
AWS Console → Amazon SES → Account Dashboard → Sending Statistics
```

You'll see:
- Daily sending quota
- Emails sent in last 24 hours
- Maximum send rate
- Bounce rate (keep below 5%)
- Complaint rate (keep below 0.1%)

### Quota Increase Request Process

Same path as before: AWS Support → Service Limit Increase → SES Sending Limits. The difference is now you have data to back your request.

In your use case description, include:
- Your current quota and daily volume
- Average bounce and complaint rates over the last 30 days
- Why you need the increase (new clients, expanded campaigns, etc.)
- Your sending infrastructure (dedicated IPs, domain setup)

A clean 30-day history with bounce rates under 2% and complaint rates under 0.08% will get you approved for 10x increases without pushback.

## Step 3: Structure Your Sending to Stay Under Limits

Quota management isn't just about requesting higher numbers — it's about architecting your sending so you never get throttled mid-campaign.

### Use Multiple SES Regions

This is the move most people miss. AWS SES limits are **per-region**. You can run simultaneous sending across:
- us-east-1 (N. Virginia)
- us-west-2 (Oregon)
- eu-west-1 (Ireland)

That's 150,000 emails/day across three regions on default production limits. Configure your application to distribute sends across regions and you've tripled your effective quota without a single support ticket.

### Dedicated IP Addresses

At $24.95/month per dedicated IP, this is worth it once you're sending more than 10,000 emails/day. With shared IPs, you're dependent on other SES users' behavior. With dedicated IPs, your reputation is entirely in your hands.

Request dedicated IPs through: **SES Console → Dedicated IPs → Request Dedicated IPs**

Note: You need to warm dedicated IPs gradually. Start at 200/day and increase by 20% every 2-3 days.

### Sender Rotation

Even with high quotas, sending all volume from a single domain is risky. Rotate across multiple sending domains — each with properly configured SPF, DKIM, and DMARC. Before you set up any of this, run your domains through a [SPF/DKIM/DMARC checker](/tools/dns-checker) to make sure your authentication is solid. A misconfigured DMARC record will tank your deliverability regardless of your quota.

Also make sure your list is clean before you start volume sending. A 5% bounce rate will get your SES account suspended faster than any quota issue. Use a [bulk email verifier](/tools/email-verifier) before importing any list into your sending queue.

## Step 4: Monitor Your Metrics Before They Become Problems

AWS will suspend your account if you breach these thresholds:
- **Bounce rate > 10%** (hard threshold)
- **Complaint rate > 0.5%** (hard threshold)

But suspension risk starts well before those numbers. I've seen accounts get flagged at 4% bounce rates when the account was relatively new.

### Set Up CloudWatch Alarms

Don't rely on manually checking the SES console. Set up automated alerts:

```bash
# Create a CloudWatch alarm for bounce rate
aws cloudwatch put-metric-alarm \
  --alarm-name ses-bounce-rate-high \
  --metric-name Reputation.BounceRate \
  --namespace AWS/SES \
  --statistic Average \
  --period 3600 \
  --threshold 0.03 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT:ses-alerts
```

Set your alarm at 3% bounce rate — that gives you runway to clean your list before hitting AWS's review threshold.

### Weekly Infrastructure Review

I run a weekly check on every sending account. The [weekly cold email health check](/blog/weekly-cold-email-health-check-review) I follow covers SES metrics alongside deliverability and engagement data. It takes 15 minutes and has caught problems before they became suspensions multiple times.

## The Cleanmails Approach to SES Management

If you're running cold email campaigns at any real volume, managing SES quotas manually across multiple regions and domains gets complex fast. [Cleanmails](/) handles sender rotation, quota distribution, and bounce management natively — it connects directly to your SES configuration so you're not juggling AWS console tabs while trying to run campaigns.

The one-time pricing model also means you're not paying per email or per seat as your SES quota grows, which matters when you're scaling.

For context on why managing your own infrastructure beats renting it, the post on [why monthly cold email subscriptions are killing your ROI](/blog/why-monthly-cold-email-subscriptions-are-killing-your-roi) breaks down the math clearly.

## Common SES Quota Request Mistakes

**Mistake 1: Requesting too much too soon.** If you're sending 500 emails/day and request a 500,000/day quota, you'll get rejected or face a lengthy review. Request 5-10x your current volume, not 1000x.

**Mistake 2: Vague use case descriptions.** "Email marketing" gets more scrutiny than "outbound B2B sales outreach to verified business contacts in the [industry] space."

**Mistake 3: Not warming up before hitting new quotas.** Getting approved for 50,000/day and immediately sending 50,000 emails will spike your bounce rate and get your account flagged. Ramp up over 2 weeks.

**Mistake 4: Ignoring configuration notifications.** AWS sends emails to your account's root email when there are deliverability issues. Most people never check that inbox. Set it to forward somewhere you actually read.

**Mistake 5: Dirty lists.** This is the #1 cause of SES suspensions. Run every list through a [CSV email list cleaner](/tools/csv-cleaner) before you ever import it. Catching invalid emails before sending is infinitely better than managing the bounce fallout after.

## Quick Reference: AWS SES Limits at a Glance

| Mode | Daily Quota | Send Rate | Recipient Restriction |
|------|-------------|-----------|----------------------|
| Sandbox | 200/day | 1 msg/sec | Verified only |
| Production (default) | 50,000/day | 14 msg/sec | Any valid address |
| Production (increased) | Up to millions | Up to 100+ msg/sec | Any valid address |
| Per dedicated IP | ~50,000/day | Varies | Any valid address |

## The 30-Minute Action Plan

If you want to implement everything in this guide today:

1. **Minutes 1-5:** Check your current SES account status and sending statistics in the AWS console
2. **Minutes 5-10:** Verify your SPF, DKIM, and DMARC records with the [DNS checker](/tools/dns-checker)
3. **Minutes 10-15:** Clean your sending list with the [bulk email verifier](/tools/email-verifier)
4. **Minutes 15-25:** Submit your sandbox removal or quota increase request using the template above
5. **Minutes 25-30:** Set up a CloudWatch alarm for bounce rate at 3% threshold

The request will take 24-48 hours to process. The infrastructure work you do in the meantime is what determines whether you stay approved long-term.

AWS SES is genuinely excellent infrastructure for cold email when you manage it properly. The limits aren't obstacles — they're guardrails that, if you work within them intelligently, protect your deliverability better than any paid warm-up service ever could.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [The Weekly Cold Email Health Check: 7 Things to Review Every Monday](/blog/weekly-cold-email-health-check-review)
- [Why I Stopped Using Google Workspace for Cold Email](/blog/why-i-stopped-using-google-workspace-cold-email)
- 🛠️ Tool: [SPF/DKIM/DMARC Checker](/tools/dns-checker)