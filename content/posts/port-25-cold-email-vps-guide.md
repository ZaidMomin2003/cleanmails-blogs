---
title: "Why Port 25 Matters for Cold Email (And How to Get It)"
slug: "port-25-cold-email-vps-guide"
date: "2026-05-22"
author: "cold mail"
tags: ["SMTP", "VPS", "deliverability", "cold email infrastructure", "self-hosted"]
category: "SMTP"
coverImage: "https://images.pexels.com/photos/17489157/pexels-photo-17489157.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Detailed view of a server rack with a focus on technology and data storage."
excerpt: "Port 25 is the single most important thing most cold emailers have never thought about — and getting it unblocked on your VPS is the difference between landing in inboxes and disappearing into the void."
readTime: "9 min read"
photographerName: "panumas nikhomkhai"
photographerUrl: "https://www.pexels.com/@cookiecutter"
---

Most people setting up cold email infrastructure get everything right — SPF, DKIM, DMARC, warmed-up domains — and still can't send a single email from their own server. The culprit? Port 25 is blocked, and nobody told them.

If you've been searching for answers on **port 25 cold email VPS** setups, this post is the one you've been looking for. I'm going to explain exactly what port 25 is, why it's blocked by default on virtually every major cloud provider, which VPS providers actually give you access to it, and how to get unblocked so you can run a real self-hosted cold email operation.

## What Port 25 Actually Does (And Why It's the One That Matters)

Every email you've ever sent traveled through a specific TCP port. Here's the breakdown:

| Port | Protocol | Purpose |
|------|----------|---------|
| 25 | SMTP | Server-to-server email delivery |
| 587 | SMTP Submission | Client-to-server (your app to a relay) |
| 465 | SMTPS | Encrypted submission (older standard) |
| 993 | IMAP | Receiving/reading email |

Port 25 is the one your mail server uses to **deliver email directly to the recipient's mail server**. When you send an email via Postfix or any self-hosted SMTP setup, your server opens a connection on port 25 to Gmail's servers, or Outlook's servers, and delivers the message directly.

Port 587 is what you use when you're routing through a *relay* — like SendGrid, Mailgun, or Amazon SES. You're handing your email off to someone else's infrastructure to deliver it for you.

**Here's the contrarian take most people miss:** routing through a relay means you're sharing IP reputation with thousands of other senders. When some spammer on the same relay blasts garbage, your deliverability takes the hit too. Direct delivery via port 25 from a dedicated IP gives you full ownership of your sender reputation — nobody else can tank it but you.

## Why Port 25 Is Blocked by Default on Every Major Cloud Provider

This is where new self-hosters hit a wall. You spin up a VPS on DigitalOcean, AWS, Google Cloud, or Vultr, install Postfix, configure everything perfectly — and your emails either bounce immediately or vanish into a black hole.

The reason: **port 25 outbound is blocked at the network level** by almost every major cloud provider, by default, with no UI toggle to fix it.

Why? Because cloud providers got absolutely hammered by spammers in the early 2010s. Botnets would spin up thousands of VMs, blast millions of spam emails, and disappear before anyone could react. The providers' IP ranges got blacklisted en masse. Their solution was to block port 25 outbound for all new accounts.

Here's the breakdown of the major providers:

### AWS EC2
Blocked by default. You have to submit a formal request through the AWS console under "Service Quotas" → "Amazon Elastic Compute Cloud (Amazon EC2)" → "Request to remove email sending limitations." AWS reviews your use case. Approval is not guaranteed and can take 2-5 business days. They'll ask about your sending volume, use case, and opt-out mechanisms.

### Google Cloud (GCP)
Blocked permanently on port 25 for outbound. Google does not unblock it, period. You can use port 587 to relay through external SMTP, but you cannot do direct delivery from GCP. If you're building serious cold email infrastructure, GCP is a dead end for this purpose.

### DigitalOcean
Blocked by default for new accounts. You can request removal by contacting support. Generally more responsive than AWS — most legitimate requests are approved within 24-48 hours if your account has some history and you can explain your use case clearly.

### Vultr
Same story — blocked by default, request-based unblocking. Vultr tends to be fairly responsive and has a reputation in the self-hosted email community for being reasonable about approvals.

### Hetzner
This is the one that surprises people. **Hetzner does not block port 25 by default.** Their servers in Germany and Finland come with port 25 open out of the box. This is a big reason why Hetzner has become the go-to provider for self-hosted email setups. The tradeoff: their IP ranges have some history of being on spam lists, so you need to check your IP reputation immediately after provisioning.

### Contabo
Also generally open on port 25. Cheap, European-based, and less restrictive. IP quality can be hit or miss — always check with [MXToolbox](https://mxtoolbox.com) and our [SPF/DKIM/DMARC Checker](/tools/dns-checker) before committing to an IP.

## How to Get Port 25 Unblocked: Step-by-Step

If you're on a provider that blocks port 25 by default, here's how to approach the unblocking request in a way that actually gets approved:

### 1. Build Some Account History First
Don't spin up a brand new account and immediately request port 25 access. Run the account for a week or two. Pay a bill. Add a payment method. Providers are more likely to approve accounts that look like legitimate businesses.

### 2. Write a Clear, Specific Use Case
Vague requests get denied. Be specific:

**Bad:** "I want to send emails from my server."

**Good:** "I run a B2B outreach operation for [specific industry]. I send approximately 500-1,000 emails per day to verified business contacts who have publicly listed their information. I maintain a hard bounce rate under 2%, process unsubscribe requests immediately, and use email validation before sending. I need port 25 access to run my own SMTP server for deliverability control."

### 3. Verify Your IP Isn't Already Blacklisted
Before you even start the unblocking process, check your server's IP against the major blacklists. If the IP is already listed, request a different IP or a different server before proceeding.

### 4. Test Immediately After Unblocking
Once unblocked, run this from your server:

```bash
telnet gmail-smtp-in.l.google.com 25
```

If you see a `220` response, port 25 is open and you can reach Gmail's mail servers. If it times out, port 25 is still blocked.

You can also test with:

```bash
nc -zv gmail-smtp-in.l.google.com 25
```

## Port 25 Cold Email VPS: My Recommended Stack

After testing various setups, here's what I'd recommend for a port 25 cold email VPS that's actually reliable:

**Provider:** Hetzner CX22 (€4.35/month, 2 vCPU, 4GB RAM) or Contabo VPS S
**OS:** Ubuntu 22.04 LTS
**MTA:** Postfix with proper hostname configuration
**Authentication:** SPF, DKIM (2048-bit), DMARC — all three, non-negotiable

For the full setup walkthrough, [this guide on self-hosted email server setup](/blog/self-hosted-email-server-setup-5-dollar-vps) covers the Postfix configuration in detail.

The authentication setup is where most people cut corners and pay for it with spam folder placement. Get all three records right using our [SPF/DKIM/DMARC Checker](/tools/dns-checker) to verify before you send a single email.

## The Reputation Problem Nobody Talks About

Here's something that trips up even experienced cold emailers: **getting port 25 unblocked is the easy part. Getting your IP's reputation to a point where major providers will accept your mail is the hard part.**

Fresh IPs from providers like Hetzner and Contabo often have spotty histories. The previous user of that IP may have been a spammer. You need to:

1. **Check the IP against 50+ blacklists** before sending anything
2. **Warm the IP slowly** — start with 20-30 emails/day and ramp over 3-4 weeks
3. **Monitor bounce rates obsessively** — anything above 3% is a red flag
4. **Validate your list before sending** — use our [Bulk Email Verifier](/tools/email-verifier) to scrub invalid addresses before they generate hard bounces

Hard bounces from invalid addresses are the fastest way to get your IP flagged. One sending session to a dirty list can undo weeks of careful warming.

## When Port 25 Isn't Enough: The Rotation Argument

Once you have port 25 working and a warmed IP, you'll quickly discover the next problem: volume limits. Sending more than 300-500 emails per day from a single IP starts to raise flags with major inbox providers, especially Outlook/Hotmail which is notoriously aggressive about rate-limiting new IPs.

The solution is sender rotation across multiple IPs and domains — which is exactly why [cold email sender rotation](/blog/optimizing-cold-email-sender-rotation-for-high-volume-outreach) is such a critical part of any serious infrastructure setup.

This is also where a platform like [cold mail](https://cold mail.com) becomes genuinely useful — it's built specifically to handle multi-sender rotation with its own inbuilt SMTP, so you're not duct-taping together Postfix instances manually. One-time $497, no monthly fees, runs on your own VPS. When you're managing 10+ sender accounts across multiple domains, the automation pays for itself in the first week.

## Quick-Start Checklist: Port 25 Cold Email VPS in Under 30 Minutes

If you want to take action today:

- [ ] Provision a Hetzner CX22 server (port 25 open by default)
- [ ] Run `telnet gmail-smtp-in.l.google.com 25` to confirm port 25 is accessible
- [ ] Check your IP against blacklists at MXToolbox
- [ ] Install Postfix and configure your hostname and reverse DNS (PTR record)
- [ ] Set up SPF, DKIM, and DMARC records — verify with our [DNS Checker](/tools/dns-checker)
- [ ] Validate your sending list with our [Bulk Email Verifier](/tools/email-verifier)
- [ ] Start warming: 25 emails day 1, increase by 25/day each week
- [ ] Monitor bounce rates daily for the first 30 days

The whole initial setup — from VPS provisioning to first test email — genuinely takes under 30 minutes if you follow a good guide. The [complete guide to sending cold email from your own server](/blog/send-cold-email-own-server-complete-guide) walks through every step.

## The Bottom Line

Port 25 is not a technical detail you can ignore. It's the foundation of whether your self-hosted cold email infrastructure actually works. Most cloud providers block it because of abuse history, but getting it unblocked is straightforward if you approach it correctly — or you avoid the problem entirely by choosing a provider like Hetzner that doesn't block it in the first place.

The combination of port 25 access, proper authentication records, a clean IP, and disciplined list hygiene is what separates cold emailers who consistently land in the primary inbox from those who wonder why nothing works despite doing everything else right.

Own your infrastructure. Control your deliverability. Don't let a shared relay decide your sender reputation for you.

---

**Related:**
- [I Replaced My $300/Month Email Stack With a $5 VPS — Full Setup Guide](/blog/self-hosted-email-server-setup-5-dollar-vps)
- [How to Set Up SPF, DKIM, and DMARC in Under 10 Minutes](/blog/spf-dkim-dmarc-setup-tutorial)
- [SMTP Rotation: How to Send at Scale Without Getting Blacklisted](/blog/smtp-rotation-explained)
- 🛠️ Tool: [SPF/DKIM/DMARC Checker](/tools/dns-checker)
