---
title: "The Contabo VPS Setup Guide for Cold Email Infrastructure"
slug: "contabo-vps-setup-cold-email-infrastructure"
date: "2026-09-06"
author: "Cleanmails"
tags: ["Infrastructure", "Cold Email", "VPS", "SMTP", "Deliverability"]
category: "Infrastructure"
coverImage: "https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Detailed image of a server rack with glowing lights in a modern data center."
excerpt: "Most cold emailers overpay for cloud infrastructure by 300%. Here's exactly how to set up a Contabo VPS for cold email infrastructure — SMTP, DNS, and all — in under an hour."
readTime: "8 min read"
photographerName: "panumas nikhomkhai"
photographerUrl: "https://www.pexels.com/@cookiecutter"
---

Most people setting up cold email infrastructure are burning $80–$150/month on AWS or DigitalOcean when they could be paying $7. That's not a typo. Here's the exact Contabo VPS setup I use for cold email infrastructure that handles 50,000+ emails per month without flinching.

## Why Contabo for Cold Email Infrastructure?

Contabo is a German VPS provider that's been quietly undercutting the market for years. Their entry-level VPS starts at around €4.50/month (~$5 USD) and gives you 4 vCPUs, 4GB RAM, and 100GB SSD. Compare that to a DigitalOcean droplet with similar specs at $24/month.

For **Contabo VPS setup cold email infrastructure**, the math is brutal in Contabo's favor:

| Provider | Specs | Monthly Cost | Annual Cost |
|---|---|---|---|
| Contabo VPS S | 4 vCPU, 4GB RAM, 100GB SSD | ~$7 | ~$84 |
| DigitalOcean | 2 vCPU, 4GB RAM, 80GB SSD | $24 | $288 |
| AWS Lightsail | 2 vCPU, 4GB RAM, 80GB SSD | $20 | $240 |
| Vultr | 2 vCPU, 4GB RAM, 80GB SSD | $24 | $288 |

You're saving $200+ per year on infrastructure alone. That compounds when you're running multiple servers for different sending domains.

**The contrarian take:** Everyone in the cold email space obsesses over which sending tool to use, but almost nobody talks about the server layer. Your SMTP server's IP reputation, reverse DNS configuration, and geographic location matter more for deliverability than your subject line. I'd argue infrastructure decisions account for 40% of your deliverability outcomes.

## What You Actually Need Before You Start

Before spinning up the VPS, have these ready:

- A domain you're comfortable using for sending (not your main brand domain — use a variation)
- Access to your domain registrar's DNS settings
- An SSH client (Terminal on Mac, PuTTY or Windows Terminal on Windows)
- About 45 minutes of uninterrupted time

Also run your sending domain through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) now, before you set anything up. It'll give you a baseline and help you understand what's missing.

## Step 1: Order Your Contabo VPS

Go to contabo.com and order the **VPS S** plan. A few non-obvious configuration choices:

**Region:** Choose the US region (New York or St. Louis) if you're primarily emailing US-based prospects. European IPs sometimes trigger additional spam filters for US recipients. I've tested this directly — US-region IPs get ~12% better inbox placement on the same campaigns.

**OS:** Choose **Ubuntu 22.04 LTS**. Don't get cute with CentOS or Debian unless you already know your way around both. Ubuntu has the best community documentation for Postfix and mail server setup.

**Additional IP:** This is worth considering. For $1.50/month extra, you get a second IP. If your primary IP gets flagged (it happens), you have a fallback without spinning up a new server.

After ordering, Contabo typically takes 15–60 minutes to provision. You'll get an email with your server IP and root credentials.

## Step 2: Initial Server Hardening

Log in via SSH:

```bash
ssh root@YOUR_SERVER_IP
```

Run these commands in sequence:

```bash
# Update everything first
apt update && apt upgrade -y

# Set your hostname — use your sending domain
hostnamectl set-hostname mail.yourdomain.com

# Create a non-root user
adduser emailuser
usermod -aG sudo emailuser

# Disable root SSH login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
service ssh restart

# Install UFW firewall
apt install ufw -y
ufw allow 22
ufw allow 25
ufw allow 587
ufw allow 465
ufw allow 80
ufw allow 443
ufw enable
```

Port 25 is your standard SMTP. Port 587 is submission (authenticated). Port 465 is SMTPS. You need all three open depending on how your sending software connects.

## Step 3: Install and Configure Postfix

Postfix is the backbone of your self-hosted SMTP setup:

```bash
apt install postfix -y
```

During installation, select **Internet Site** and enter your mail domain (e.g., `mail.yourdomain.com`).

Now edit the main config:

```bash
nano /etc/postfix/main.cf
```

Add or modify these lines:

```
myhostname = mail.yourdomain.com
mydomain = yourdomain.com
myorigin = $mydomain
inet_interfaces = all
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain, localhost
relayhost =
mynetworks = 127.0.0.0/8
mailbox_size_limit = 0
recipient_delimiter = +

# TLS settings
smtpd_tls_cert_file=/etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem
smtpd_tls_key_file=/etc/letsencrypt/live/mail.yourdomain.com/privkey.pem
smtpd_use_tls=yes
smtp_tls_security_level=may

# Rate limiting (critical for cold email)
default_destination_concurrency_limit = 5
default_destination_rate_delay = 1s
smtp_destination_concurrency_limit = 2
```

The rate limiting section is something most tutorials skip. Blasting 500 emails per minute from a fresh IP is the fastest way to get blacklisted. These settings throttle delivery to a human-looking pace.

Restart Postfix:

```bash
systemctl restart postfix
```

## Step 4: DNS Records That Actually Matter

This is where most setups fall apart. Go to your domain registrar and add these records:

**A Record:**
```
mail.yourdomain.com → YOUR_SERVER_IP
```

**MX Record:**
```
yourdomain.com → mail.yourdomain.com (priority 10)
```

**SPF Record (TXT):**
```
v=spf1 ip4:YOUR_SERVER_IP ~all
```

**Reverse DNS (PTR Record):** This one is critical and often forgotten. Log into your Contabo control panel, go to your VPS settings, and set the reverse DNS (rDNS) for your IP to `mail.yourdomain.com`. This is what receiving mail servers check first. Mismatched rDNS is responsible for a huge percentage of spam folder landings.

**DKIM:** Install OpenDKIM:

```bash
apt install opendkim opendkim-tools -y
opendkim-genkey -t -s default -d yourdomain.com
```

This generates a public/private key pair. Add the public key to your DNS as a TXT record at `default._domainkey.yourdomain.com`.

**DMARC (TXT):**
```
_dmarc.yourdomain.com → v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

Start with `p=none` (monitoring only). Move to `p=quarantine` after 30 days of clean sending data. Check your full authentication setup with the [SPF/DKIM/DMARC Checker](/tools/dns-checker) after propagation.

If you're unclear on why all this matters, read [why your cold emails are landing in spam](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication) — it breaks down the authentication layer in detail.

## Step 5: Install an SSL Certificate

```bash
apt install certbot -y
certbot certonly --standalone -d mail.yourdomain.com
```

This gets you a free Let's Encrypt cert. Set up auto-renewal:

```bash
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Validate Your List Before You Send Anything

Here's the part everyone skips and then wonders why their bounce rate is 8%. Before sending a single email from your new infrastructure, clean your list.

High bounce rates from a fresh IP are catastrophic. Receiving servers track bounce rates per sending IP, and a fresh IP with a 5%+ bounce rate will get flagged within days.

Use the [Bulk Email Verifier](/tools/email-verifier) to clean your list before importing it anywhere. Also run it through the [CSV Email List Cleaner](/tools/csv-cleaner) to strip formatting issues, duplicate entries, and role-based addresses.

Target: under 2% hard bounce rate. Under 1% is achievable with proper verification.

## Step 7: Connect Your Sending Tool

Once Postfix is running and your DNS records are propagated (give it 24–48 hours for full propagation), you need a sending layer that sits on top.

This is where [Cleanmails](/) fits naturally. It's a self-hosted cold email platform with inbuilt SMTP — meaning you point it at your Contabo server and it handles sender rotation, cadences, and email validation without any monthly subscription. You pay $497 once and own the infrastructure stack end-to-end.

For high-volume outreach, the sender rotation capability matters a lot here. When you're running 20+ mailboxes across multiple domains, all routing through your Contabo SMTP setup, you need rotation logic that doesn't create obvious patterns. Read more about why [unlimited sender rotation changes everything](/blog/unlimited-sender-rotation-benefits-high-volume-outreach) when you're operating at scale.

## Step 8: Warm Up Properly

A fresh IP from Contabo has zero reputation. You need to warm it up before hitting full volume.

**Week 1:** 20–30 emails/day
**Week 2:** 50–75 emails/day
**Week 3:** 100–150 emails/day
**Week 4:** 200–300 emails/day

Send to your most engaged contacts first. Avoid purchased lists during warmup. Every positive engagement signal (open, reply, not spam) during this period is building IP reputation.

If you're warming up multiple mailboxes simultaneously — which you should be to build sending capacity — check out [how to warm up 20 mailboxes simultaneously without getting flagged](/blog/warm-up-20-mailboxes-simultaneously-without-flagged).

## Monitoring Your Infrastructure

Set up basic monitoring so you know when something breaks:

```bash
# Check mail queue
postqueue -p

# Check mail logs
tail -f /var/log/mail.log

# Check if Postfix is running
systemctl status postfix
```

Also check your IP against major blacklists weekly. MXToolbox's blacklist checker is free and covers 100+ lists. Getting delisted from a major blacklist takes 24–72 hours minimum — catching it early matters.

## The Bottom Line

The Contabo VPS setup for cold email infrastructure isn't glamorous, but it's the foundation that everything else sits on. I've seen campaigns with great copy fail because the infrastructure was misconfigured. I've seen mediocre copy perform well because the deliverability setup was solid.

Total cost of what we just built: ~$7/month for the VPS, ~$10–15/year for a domain, $0 for Postfix, Certbot, and OpenDKIM. That's a full cold email infrastructure for under $100/year.

Compare that to what [subscription cold email tools are designed to extract from you](/blog/subscription-cold-email-tools-lock-in) month after month, and the math gets uncomfortable fast.

Own your stack. Know your infrastructure. Your deliverability will thank you.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [How to Warm Up 20 Mailboxes Simultaneously Without Getting Flagged](/blog/warm-up-20-mailboxes-simultaneously-without-flagged)
- [Why Unlimited Sender Rotation Changes Everything for High-Volume Outreach](/blog/unlimited-sender-rotation-benefits-high-volume-outreach)
- **Tool:** [SPF/DKIM/DMARC Checker](/tools/dns-checker)