---
title: "How to Set Up SPF, DKIM, and DMARC in Under 10 Minutes"
slug: "spf-dkim-dmarc-setup-tutorial"
date: "2026-05-14"
author: "Cleanmails"
tags: ["Deliverability", "Email Authentication", "Cold Email", "DNS", "Technical Setup"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/7821764/pexels-photo-7821764.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Laptop showing email next to green plant, ideal for tech and productivity concepts."
excerpt: "Most cold emailers lose 30-40% of their deliverability before sending a single email — just because SPF, DKIM, and DMARC aren't configured correctly. Here's how to fix all three in under 10 minutes."
readTime: "9 min read"
photographerName: "RDNE Stock project"
photographerUrl: "https://www.pexels.com/@rdne"
---

Most cold emailers are sabotaging their own deliverability before they send a single message. I've audited hundreds of cold email setups, and the same mistake shows up every time: missing or misconfigured SPF, DKIM, and DMARC records. This SPF DKIM DMARC setup tutorial will fix that — permanently — in under 10 minutes.

Let me be blunt about something first.

## The Surprising Truth About Email Authentication

Here's a stat that should stop you cold: **Google's own data shows that Gmail rejects or junks billions of unauthenticated messages every day**. And since Gmail's February 2024 bulk sender requirements went live, sending without proper authentication to Gmail addresses doesn't just hurt your deliverability — it can get your domain blocked outright.

But here's the counterintuitive part most people miss: **DMARC is not optional anymore, even if you're only sending 100 emails a day.** I see small senders skip it constantly because they think it's only for enterprise. That's wrong. Google and Yahoo now require a DMARC policy for anyone sending bulk email, and "bulk" in their definition starts at 5,000 messages per day to Gmail. Miss this threshold once and your entire domain's reputation takes a hit that takes weeks to recover.

Let's fix this right now.

---

## What SPF, DKIM, and DMARC Actually Do (30-Second Version)

Before we touch DNS, here's the plain-English version:

- **SPF (Sender Policy Framework):** A DNS TXT record that tells receiving mail servers *which IP addresses are allowed to send email from your domain*. If your ESP's IPs aren't listed, your emails look suspicious.
- **DKIM (DomainKeys Identified Mail):** A cryptographic signature added to your email headers. The receiving server checks it against a public key in your DNS. If it matches, the email wasn't tampered with in transit.
- **DMARC (Domain-based Message Authentication, Reporting & Conformance):** The policy layer that tells receiving servers *what to do* when SPF or DKIM fails — and sends you reports so you can monitor abuse.

Think of it this way: SPF is the guest list, DKIM is the wax seal on the envelope, and DMARC is the bouncer with instructions for what to do with crashers.

---

## Step-by-Step SPF DKIM DMARC Setup Tutorial

### Step 1: Set Up Your SPF Record (2 Minutes)

Log into your domain registrar or DNS provider (Cloudflare, Namecheap, GoDaddy — wherever your DNS lives).

Create a new **TXT record** on your root domain (`@`) with this format:

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com ~all
TTL: 3600
```

Replace `include:_spf.google.com` with your actual sending provider's SPF include. Common ones:

| Provider | SPF Include |
|---|---|
| Google Workspace | `include:_spf.google.com` |
| Microsoft 365 | `include:spf.protection.outlook.com` |
| SendGrid | `include:sendgrid.net` |
| Mailgun | `include:mailgun.org` |
| Amazon SES | `include:amazonses.com` |
| Self-hosted SMTP | `ip4:YOUR.SERVER.IP.HERE` |

**Critical rule:** You can only have **one SPF record** per domain. If you already have one, edit it — don't add a second. Multiple SPF records cause a "permerror" and your authentication fails completely.

If you're sending from multiple providers, chain them:

```
v=spf1 include:_spf.google.com include:sendgrid.net ip4:123.456.789.0 ~all
```

Keep the mechanism count under 10 or you'll hit the DNS lookup limit.

**The `~all` vs `-all` debate:** Use `~all` (softfail) while you're setting things up. Switch to `-all` (hardfail) only after you've confirmed everything is working. I've seen people use `-all` on day one and accidentally block their own legitimate email.

---

### Step 2: Set Up Your DKIM Record (3 Minutes)

DKIM setup depends on your email provider because they generate the key pair for you.

**For Google Workspace:**
1. Go to Admin Console → Apps → Google Workspace → Gmail → Authenticate Email
2. Click "Generate New Record"
3. Copy the TXT record value Google gives you
4. Add it to DNS:

```
Type: TXT
Host: google._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSq... (long key Google gives you)
TTL: 3600
```

**For Microsoft 365:**
1. Go to Security portal → Email & collaboration → Policies & rules → Threat policies → DKIM
2. Select your domain, click "Enable"
3. Microsoft will give you two CNAME records to add — add both

**For self-hosted SMTP (like on a VPS):**

If you're running your own mail server, you'll generate the key yourself. Using OpenDKIM:

```bash
openssl genrsa -out dkim_private.key 2048
openssl rsa -in dkim_private.key -pubout -out dkim_public.key
```

Then publish the public key in DNS under `mail._domainkey.yourdomain.com`.

For anyone running self-hosted cold email infrastructure, I'd point you to [this full VPS setup guide](/blog/self-hosted-email-server-setup-5-dollar-vps) — it covers DKIM configuration end-to-end alongside the server setup itself.

---

### Step 3: Set Up Your DMARC Record (2 Minutes)

This is the one most people skip. Don't.

Add a new TXT record:

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com
TTL: 3600
```

Breaking down the tags:

| Tag | What It Does |
|---|---|
| `v=DMARC1` | Protocol version — always this |
| `p=none` | Policy: none / quarantine / reject |
| `rua=mailto:...` | Where aggregate reports get sent |
| `ruf=mailto:...` | Where forensic reports get sent (optional) |
| `pct=100` | Percentage of mail the policy applies to |
| `adkim=r` | DKIM alignment: relaxed (r) or strict (s) |
| `aspf=r` | SPF alignment: relaxed (r) or strict (s) |

**The policy progression I recommend:**

1. **Week 1-2:** `p=none` — monitor only, nothing gets blocked. Check your reports.
2. **Week 3-4:** `p=quarantine` — failing emails go to spam instead of inbox.
3. **Month 2+:** `p=reject` — failing emails are outright rejected.

Don't jump straight to `p=reject`. I've watched people do this and accidentally quarantine their own transactional emails because a third-party tool wasn't in their SPF record. Take the two weeks at `p=none` — it's worth it.

---

### Step 4: Verify Everything Is Working (3 Minutes)

DNS propagation typically takes 5-30 minutes (up to 48 hours in edge cases). Once it's live, verify all three records with our free [SPF/DKIM/DMARC Checker](/tools/dns-checker).

You're looking for:
- ✅ SPF: Valid record found, no permerror
- ✅ DKIM: Public key found, signature valid
- ✅ DMARC: Policy record found, valid syntax

Alternatively, send a test email to `check-auth@verifier.port25.com` — they'll reply with a full authentication report showing exactly what passed and failed.

---

## The Alignment Problem Nobody Talks About

Here's where I see setups fail even when all three records exist: **DMARC alignment**.

DMARC requires that the domain in your `From:` header *aligns* with either the SPF-authenticated domain or the DKIM-signing domain. 

Practical example: You're sending from `outreach@sales.yourdomain.com` but your SPF record is only on `yourdomain.com`. With relaxed alignment (`aspf=r`), this passes because the organizational domains match. With strict alignment (`aspf=s`), it fails.

This trips up cold emailers using subdomains for outreach — which is actually the right strategy for [protecting your main domain's sender reputation](/blog/how-to-manage-email-sender-reputation-for-cold-outreach-success). Just make sure your SPF, DKIM, and DMARC records exist on the **subdomain** itself, not just the root domain.

---

## Common Setup Mistakes That Kill Deliverability

**1. Multiple SPF records**
I see this constantly. Someone adds an SPF record, then their developer adds another one for a different tool. Result: permerror. You get zero credit. Fix: merge everything into one record.

**2. DKIM key rotation neglect**
DKIM keys should be rotated every 6-12 months. Set a calendar reminder. A compromised DKIM key that's been leaked can be used to forge your email signature.

**3. Forgetting sending subdomains**
If you use `mail.yourdomain.com` or `outreach.yourdomain.com` for cold email (you should be — [here's why domain warm-up matters](/blog/how-to-warm-up-a-new-cold-email-domain)), those subdomains need their own SPF, DKIM, and DMARC records.

**4. DMARC with no reporting email**
Skipping `rua=` means you're flying blind. You won't know if someone's spoofing your domain or if your own emails are failing authentication. Always add a reporting address.

**5. Not checking BIMI readiness**
If you're planning to use BIMI (Brand Indicators for Message Identification — the logo that shows in Gmail), you need `p=quarantine` or `p=reject` on your DMARC policy first. Worth knowing before you invest in BIMI setup.

---

## What a Fully Configured DNS Zone Looks Like

Here's a clean example of what your DNS records should look like for `outreach.yourdomain.com`:

```
; SPF
outreach.yourdomain.com. 3600 IN TXT "v=spf1 ip4:123.45.67.89 ~all"

; DKIM
mail._domainkey.outreach.yourdomain.com. 3600 IN TXT "v=DKIM1; k=rsa; p=MIGfMA..."

; DMARC
_dmarc.outreach.yourdomain.com. 3600 IN TXT "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; adkim=r; aspf=r"
```

---

## How This Fits Into Your Full Cold Email Stack

Authentication is the foundation, but it's not the whole building. I've seen people nail SPF/DKIM/DMARC and still land in spam because their list is full of invalid addresses hammering bounce rates, or they're using the same sending IP for 500 emails an hour.

If you're running a serious cold email operation, authentication is step one. After this, your next priorities are:

1. **List hygiene** — Run your list through the [Bulk Email Verifier](/tools/email-verifier) before every campaign. A bounce rate above 3-5% will tank your sender score faster than missing DMARC.
2. **IP/domain warm-up** — Don't blast volume from a fresh domain even with perfect auth records.
3. **Sender rotation** — Distribute volume across multiple sending identities to avoid per-domain throttling.

For teams managing multiple sending domains and rotating senders across campaigns, [Cleanmails](/) handles all of this natively — the sender rotation, cadence management, and SMTP configuration are built into one self-hosted platform, so you're not stitching together five different tools to manage infrastructure that should just work.

For a deeper look at the full infrastructure picture, the [SMTP rotation guide](/blog/smtp-rotation-explained) is worth reading alongside this one.

---

## Quick Reference Checklist

Before you close this tab, run through this:

- [ ] SPF record exists on every sending domain/subdomain
- [ ] Only one SPF record per domain
- [ ] All sending IPs/providers included in SPF
- [ ] DKIM key generated and published in DNS
- [ ] DKIM signing enabled in your email provider
- [ ] DMARC record exists at `_dmarc.yourdomain.com`
- [ ] DMARC `rua=` reporting address set
- [ ] All records verified with a DNS checker
- [ ] Test email sent and authentication headers confirmed

That's it. Seriously. This should take you 10 minutes on a domain you've never touched before, and about 3 minutes if you're just fixing an existing setup.

Authentication won't make bad cold email good. But missing authentication will make good cold email invisible.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [How to Warm Up a New Cold Email Domain for Maximum Deliverability](/blog/how-to-warm-up-a-new-cold-email-domain)
- [How to Manage Email Sender Reputation for Cold Outreach Success](/blog/how-to-manage-email-sender-reputation-for-cold-outreach-success)
- 🛠 [Free SPF/DKIM/DMARC Checker](/tools/dns-checker)