---
title: "Email Validation: MX Records, DNS Checks, and What They Actually Tell You"
slug: "email-validation-mx-records-dns-checks"
date: "2026-07-22"
author: "Cleanmails"
tags: ["Deliverability", "Email Validation", "DNS", "Cold Email", "Technical"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/8850706/pexels-photo-8850706.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "A simple white paper checklist with one red checkmark, ideal for concepts like completion or approval."
excerpt: "Most cold emailers think email validation is a binary pass/fail check. It's not — and misunderstanding what MX records and DNS checks actually tell you is silently killing your deliverability."
readTime: "9 min read"
photographerName: "Tara Winstead"
photographerUrl: "https://www.pexels.com/@tara-winstead"
---

Most cold emailers think email validation is a simple green light or red light. Run a list through a verifier, delete the "invalid" ones, done. That mental model is costing you deliverability — and in some cases, it's causing you to delete perfectly good leads.

Let me break down exactly what email validation MX records DNS checks are actually doing under the hood, what each result actually means, and how to make smarter decisions with that data.

## What Email Validation Actually Does (It's Not What You Think)

When you run an email through a validator, it doesn't just check whether the address "looks right." A full validation stack runs through several layers:

1. **Syntax check** — Is the format valid? (`user@domain.com` vs `user@domain`)
2. **Domain check** — Does the domain exist?
3. **MX record lookup** — Does this domain have mail servers configured to receive email?
4. **SMTP handshake** — Can you open a connection to those mail servers and simulate delivery?
5. **Catch-all detection** — Does the server accept mail for *any* address at that domain?

Most people focus on step 1 and treat the rest as a black box. That's a mistake. Each layer tells you something different — and the devil is in the details of steps 3 through 5.

## What MX Records Actually Tell You

An MX (Mail Exchanger) record is a DNS entry that says: "Mail for this domain should be delivered to this server."

Here's what a typical MX lookup looks like:

```
$ dig MX acmecorp.com

acmecorp.com.   3600  IN  MX  10 aspmx.l.google.com.
acmecorp.com.   3600  IN  MX  20 alt1.aspmx.l.google.com.
```

This tells you three things:
- The domain is configured to receive email
- They're using Google Workspace (the `aspmx.l.google.com` giveaway)
- The priority order (lower number = higher priority)

But here's the counterintuitive part: **a valid MX record does NOT mean the email address exists.** It only means the domain *can* receive mail. The address `totallymadethat up@acmecorp.com` would pass an MX check even if it doesn't exist.

This is why I see bounce rates of 8–15% even on "validated" lists — people are treating MX validation as full validation. It's not.

### What a Missing MX Record Tells You

If there's no MX record, the domain either:
- Has never been set up to receive email
- Is a parked domain
- Is a domain someone registered for web traffic only

In all three cases: hard bounce, guaranteed. Remove it from your list.

Some validators also check for a fallback — if no MX record exists, some mail servers will attempt delivery to the A record (the domain's IP address). In practice, this almost never works for business email. Treat no-MX as undeliverable.

## DNS Checks: The Full Picture

Beyond MX records, a proper DNS check for email validation should also look at:

### SPF Records

SPF (Sender Policy Framework) tells you which servers are *authorized to send* from a domain. This is relevant for your outbound deliverability, not for validating a recipient — but it's worth understanding because it affects whether *your* emails get through.

If you're not rock-solid on SPF setup, go read [How to Set Up SPF, DKIM, and DMARC in Under 10 Minutes](/blog/spf-dkim-dmarc-setup-tutorial) before you send another email.

### DMARC Records

A DMARC record tells receiving mail servers what to do with messages that fail SPF or DKIM checks. When you're validating a *recipient*, DMARC isn't directly relevant. But if you're prospecting into domains with `p=reject` DMARC policies, know that your spoofed or misaligned sends will be dead on arrival.

### A Records and Domain Age

Good validators also cross-reference the domain's A record and registration age. A domain registered 3 days ago with no website and a generic MX pointing to some obscure mail server? That's a spam trap flag. Don't send to it.

## The Catch-All Problem (This One Hurts)

Here's where most cold emailers get burned: **catch-all domains**.

A catch-all configuration means the mail server accepts *any* email sent to that domain — `asdfghjkl@company.com`, `nobody@company.com`, all of it — without bouncing. It then silently drops it, forwards it, or lets it sit in a black hole inbox.

When a validator hits a catch-all server during SMTP verification, it gets a "250 OK" response for every address it tests. The validator can't tell if `john.smith@company.com` is real or not. So it marks the address as "catch-all" or "accept-all."

In my experience, catch-all addresses bounce at a rate of **25–40%** when you actually send to them. That's not a rounding error — that's a deliverability disaster waiting to happen.

**My rule:** If more than 30% of a domain's addresses come back as catch-all, I treat them as risky. I'll send to them in a separate, lower-volume sequence using a secondary sender — never from my primary sending domain.

This is exactly the kind of scenario where [unlimited sender rotation](/blog/unlimited-sender-rotation-benefits-high-volume-outreach) pays for itself. You're protecting your primary senders while still working the risky portion of your list.

## What Each Validation Result Actually Means

| Result | What It Means | What To Do |
|---|---|---|
| **Valid** | Syntax OK, MX exists, SMTP confirmed deliverable | Send |
| **Invalid** | Syntax error or no MX record | Delete |
| **Catch-all** | Server accepts all addresses, can't confirm existence | Send cautiously, separate sender |
| **Unknown** | SMTP connection timed out or refused | Retry once, then discard |
| **Disposable** | Temporary/throwback email service | Delete |
| **Role-based** | `info@`, `support@`, `admin@` — not a person | Suppress or use with caution |
| **Spam trap** | Known honeypot or recycled address | Delete immediately |

Role-based addresses deserve a special callout. `info@company.com` is almost never read by a decision-maker. It's monitored by an admin or routed to a shared inbox. Your personalized cold email about their Q4 pipeline will be deleted by someone who has no idea what Q4 pipeline even means. Skip them.

## A Practical Validation Workflow You Can Run Today

Here's the exact process I use before loading any list into a campaign:

**Step 1: Syntax + format clean**
Run your CSV through a cleaner first to catch formatting issues — extra spaces, broken characters, duplicate entries. The [CSV Email List Cleaner](/tools/csv-cleaner) handles this in bulk.

**Step 2: Full email verification**
Run the cleaned list through a proper verifier that checks MX, DNS, and does SMTP pinging. The [Bulk Email Verifier](/tools/email-verifier) gives you a breakdown by validation status so you can segment properly.

**Step 3: Segment by result**
- Valid → Main campaign
- Catch-all → Secondary campaign, separate sender, lower daily volume
- Role-based → Suppress unless it's a specific named role you're targeting
- Everything else → Delete

**Step 4: Verify your own DNS**
Before you send anything, make sure your sending domains are clean. Use the [SPF/DKIM/DMARC Checker](/tools/dns-checker) to confirm your authentication is solid. A misconfigured SPF record will tank deliverability regardless of how clean your list is.

This whole workflow takes under 30 minutes for a list of 5,000. There's no excuse for skipping it.

## The Surprising Part: Validation Isn't a One-Time Thing

Here's something most guides don't tell you: **email addresses decay at roughly 2–3% per month**.

People change jobs. Companies get acquired. Domains expire. An email address that was valid in January may be bouncing by July. If you're running ongoing outreach campaigns, you need to re-validate lists that are older than 90 days — not just once at import.

I've seen campaigns where someone pulled a list, validated it, sat on it for 6 months, then loaded it into a campaign and hit a 12% bounce rate. Their sending domain got flagged within a week. Six months of inactivity turned a clean list into a liability.

Cleanmails has built-in email validation that runs at the campaign level, not just at import — so you're not flying blind when you reactivate an older list. It's one of those operational details that sounds minor until you've watched a domain get blacklisted.

## Why Your Bounce Rate Is Still High (Even After Validation)

If you've validated your list and you're still seeing bounces above 3%, here's where to look:

1. **Your validator isn't doing SMTP verification** — Some cheap validators only check syntax and MX. That's not enough.
2. **You have a high catch-all percentage** — See above. Segment these out.
3. **Your list is old** — Re-validate anything older than 90 days.
4. **You're sending to role-based addresses** — These inflate your "delivered but ignored" rate, which hurts engagement metrics.
5. **Your sending infrastructure has issues** — If your IP or domain is on a blocklist, some servers will accept your email and then quietly drop it. Check [why your cold emails might be landing in spam](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication) before blaming the list.

## The Bottom Line

Email validation MX records and DNS checks are not a checkbox. They're a diagnostic tool. Each layer of validation — syntax, MX lookup, SMTP handshake, catch-all detection — tells you something specific about deliverability risk. Treating "validated" as a binary good/bad judgment is how you end up with a 10% bounce rate and a flagged domain.

Validate in layers. Segment by risk. Re-validate old lists. Protect your primary senders with rotation when you're working risky segments.

That's not advanced strategy. That's just not being sloppy.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [How to Set Up SPF, DKIM, and DMARC in Under 10 Minutes](/blog/spf-dkim-dmarc-setup-tutorial)
- [Why 93% of Cold Emails Never Get Opened (And How to Fix It)](/blog/why-93-percent-cold-emails-never-get-opened)
- 🛠️ Tool: [Bulk Email Verifier](/tools/email-verifier)