---
title: "The DMARC Policy Guide: None vs Quarantine vs Reject"
slug: "dmarc-policy-none-quarantine-reject-guide"
date: "2026-10-17"
author: "Cleanmails"
tags: ["Deliverability", "Email Authentication", "DMARC", "DNS", "Cold Email"]
category: "Deliverability"
coverImage: "https://images.pexels.com/photos/5483149/pexels-photo-5483149.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
coverImageAlt: "Overhead shot of hands typing on a laptop, showcasing technology and internet usage."
excerpt: "Most cold emailers set DMARC to 'none' and forget it — but that single misconfiguration is silently tanking your deliverability. Here's exactly when to use none, quarantine, or reject, and in what order."
readTime: "9 min read"
photographerName: "cottonbro studio"
photographerUrl: "https://www.pexels.com/@cottonbro"
---

Most cold emailers set DMARC to `p=none` during setup, pat themselves on the back, and never touch it again. That's a mistake — and it's one of the quieter reasons [why cold emails land in spam](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication) even when SPF and DKIM are technically passing.

This is the DMARC policy none quarantine reject guide I wish existed when I was debugging deliverability issues at 2am. No fluff, no "it depends" hedging — just the exact logic for choosing the right policy at the right time.

## What DMARC Actually Does (And What It Doesn't)

Before we get into the three policy modes, let's be clear on what DMARC is and isn't.

DMARC — Domain-based Message Authentication, Reporting, and Conformance — tells receiving mail servers what to do when an email fails SPF or DKIM alignment. It doesn't improve deliverability on its own. It doesn't guarantee inbox placement. What it does is:

1. Protect your domain from spoofing and phishing
2. Signal to mailbox providers that you're a legitimate, security-conscious sender
3. Give you forensic data on who's sending email on behalf of your domain

Here's the counterintuitive part most guides miss: **a DMARC policy of `p=none` with a `rua` reporting address is more valuable in the first 30 days than jumping straight to `p=reject`.** I've seen senders blow up their own deliverability by enforcing reject before they had full visibility into their sending infrastructure.

## The Three DMARC Policy Modes Explained

### p=none (Monitor Mode)

```dns
v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com; ruf=mailto:dmarc-forensics@yourdomain.com; fo=1;
```

`p=none` means: "Do nothing with failing emails — just tell me about them."

Receiving servers will still deliver the email regardless of whether it passes or fails DMARC. You get the reports, you learn what's happening, but there's zero enforcement.

**When to use it:** Always start here. Always. Even if you're confident your SPF and DKIM are set up correctly, run `p=none` for at least 2-4 weeks and collect DMARC aggregate reports (`rua`). You'll often discover third-party services sending on your behalf that you forgot about — CRMs, marketing tools, transactional email providers.

**The risk:** Zero. That's the point. But don't stay here permanently. Senders stuck on `p=none` forever are leaving domain reputation protection on the table.

### p=quarantine (Soft Enforcement)

```dns
v=DMARC1; p=quarantine; pct=25; rua=mailto:dmarc-reports@yourdomain.com; fo=1;
```

`p=quarantine` means: "If this email fails DMARC, send it to the spam/junk folder."

Notice the `pct=25` tag — that's the percentage of failing mail this policy applies to. You can ramp up gradually: 25% → 50% → 75% → 100%. This is your transition phase.

**When to use it:** After you've analyzed your DMARC reports from the `none` phase and confirmed that all your legitimate sending sources are properly authenticated. Typically 2-6 weeks after deployment.

**The surprising insight:** Most B2B cold email senders skip quarantine entirely and jump from none to reject. That's fine if your infrastructure is clean — but if you have even one misconfigured sending source, you'll start silently losing legitimate emails to spam. The `pct` parameter is your safety net.

### p=reject (Full Enforcement)

```dns
v=DMARC1; p=reject; rua=mailto:dmarc-reports@yourdomain.com; fo=1;
```

`p=reject` means: "If this email fails DMARC, reject it outright. Don't deliver it at all."

This is the gold standard. Gmail, Yahoo, and Microsoft all look favorably on domains with `p=reject`. It signals you take email security seriously — and that signal has a measurable impact on sender reputation.

**When to use it:** Once you've been on `p=quarantine; pct=100` for at least 2 weeks with no legitimate mail going to spam. At that point, you're ready.

**A note on cold email domains:** If you're using separate sending domains (which you should be — see [why I stopped using Google Workspace for cold email](/blog/why-i-stopped-using-google-workspace-cold-email)), you can typically move to `p=reject` faster because your sending infrastructure is simpler and more controlled.

## The DMARC Rollout Timeline I Actually Use

Here's the exact sequence I recommend for any new sending domain:

| Week | Policy | pct | Action |
|------|--------|-----|--------|
| 1-2 | `p=none` | N/A | Monitor reports, identify all sending sources |
| 3-4 | `p=none` | N/A | Fix any misaligned SPF/DKIM issues |
| 5 | `p=quarantine` | 25% | Watch for legitimate mail hitting spam |
| 6 | `p=quarantine` | 50% | Continue monitoring |
| 7 | `p=quarantine` | 100% | Full quarantine enforcement |
| 8+ | `p=reject` | 100% | Full rejection — you're protected |

This isn't bureaucratic caution. I've seen aggressive senders jump to `p=reject` on day 3 and wonder why their reply rates dropped 40% — turns out their ESP was sending from a subdomain that wasn't covered by their SPF record.

## How to Read Your DMARC Reports

DMARC aggregate reports come as XML files sent to your `rua` address. They're unreadable in raw form. Use a free parser like [DMARC Analyzer](https://www.dmarcanalyzer.com/dmarc/dmarc-report-analyzer/) or set up a dedicated inbox and use a tool to parse them.

What you're looking for in the reports:

- **Source IP addresses** sending on behalf of your domain
- **SPF alignment status** — is the `From` domain matching the `Return-Path` domain?
- **DKIM alignment status** — is the `From` domain matching the `d=` tag in the DKIM signature?
- **Disposition** — what the receiving server actually did with the message

A clean report looks like 100% of your email coming from known IPs, with both SPF and DKIM showing `pass`. If you see unknown IPs or consistent alignment failures, don't move to `p=quarantine` yet.

Before touching any of this, run your domain through the [SPF/DKIM/DMARC Checker](/tools/dns-checker) to get a baseline. It'll show you exactly what's published in your DNS right now — takes 30 seconds.

## The DMARC Alignment Problem Nobody Talks About

Passing SPF or DKIM isn't enough for DMARC. You need **alignment** — meaning the domain in your `From:` header has to match the domain used in SPF (`Return-Path`) or DKIM (`d=` tag).

This trips up cold emailers constantly. Here's a real scenario:

- You send from `hello@outreach.yourdomain.com`
- Your DKIM is signed by `mail.yourdomain.com`
- Your DMARC record is on `yourdomain.com`

Does DMARC pass? It depends on whether you're using **relaxed** or **strict** alignment:

- **Relaxed alignment** (`adkim=r; aspf=r`) — organizational domain match is enough. `outreach.yourdomain.com` and `yourdomain.com` share the same org domain, so it passes.
- **Strict alignment** (`adkim=s; aspf=s`) — exact domain match required. `outreach.yourdomain.com` ≠ `yourdomain.com`, so it fails.

For most cold email setups, **relaxed alignment is the right choice**. Strict alignment creates more problems than it solves unless you have a very specific security requirement.

## What Happens When You Get This Wrong

I've audited enough cold email setups to see the same failure modes repeatedly:

**Scenario 1: Stuck on p=none forever**
The sender has SPF and DKIM set up, feels good about deliverability, but never enforces DMARC. Their domain gets spoofed. Phishing emails go out under their brand. Their domain reputation tanks. They can't figure out why reply rates collapsed.

**Scenario 2: Jumped to p=reject too fast**
A SaaS founder sets up a new outreach domain, configures DMARC to `p=reject` on day one, then wonders why their Cleanmails sequences are showing delivery issues. Turns out their email validation service was sending verification emails from their domain without proper DKIM signing.

**Scenario 3: DMARC on the wrong domain**
They set up DMARC on `yourdomain.com` but send cold email from `getprod.io` — a completely separate domain. The DMARC record on their main domain does nothing for their sending domain. These are independent DNS configurations.

This is exactly why the [weekly cold email health check](/blog/weekly-cold-email-health-check-review) I recommend includes a DMARC verification step every Monday. DNS records get changed, third-party tools get added — and your authentication setup drifts silently.

## The Minimum Viable DMARC Record for Cold Email

If you want to get started today, here's the record I'd publish for a new cold email sending domain:

```dns
v=DMARC1; p=none; rua=mailto:dmarc@yoursendingdomain.com; ruf=mailto:dmarc@yoursendingdomain.com; fo=1; adkim=r; aspf=r;
```

Breaking it down:
- `v=DMARC1` — version, always this
- `p=none` — monitor mode to start
- `rua=` — where aggregate reports go
- `ruf=` — where forensic (per-failure) reports go
- `fo=1` — send forensic reports on any authentication failure (not just total DMARC failure)
- `adkim=r; aspf=r` — relaxed alignment for both DKIM and SPF

Publish this as a TXT record on `_dmarc.yoursendingdomain.com`.

Then set a calendar reminder for 2 weeks from now to check your reports and move to `p=quarantine; pct=25`.

## Practical Checklist: DMARC Setup in Under 30 Minutes

1. **Check your current state** — use the [SPF/DKIM/DMARC Checker](/tools/dns-checker) to see what's already published
2. **Set up a dedicated reporting inbox** — create `dmarc@yourdomain.com` or use a free DMARC reporting service
3. **Publish the `p=none` record** — the template above, customized with your reporting address
4. **Verify the record published correctly** — run the checker again, confirm it shows up
5. **Wait 48-72 hours** for reports to start arriving
6. **Analyze reports after 2 weeks** — identify all sending sources, fix any alignment issues
7. **Move to `p=quarantine; pct=25`** — begin enforcement
8. **Escalate to `p=reject`** — after 3-4 weeks of clean quarantine data

If you're running a multi-domain cold email setup — which is the right way to protect your main domain — platforms like [Cleanmails](/) make this manageable because each sending domain is isolated. A DMARC issue on one domain doesn't bleed into others, and you can check authentication status per domain without jumping between DNS dashboards.

## My Stance: p=reject Is the Goal, Always

I'll be direct: if your DMARC policy isn't moving toward `p=reject`, you're leaving both domain protection and deliverability reputation on the table. The "but I don't want to lose any email" concern is valid — which is exactly why the phased rollout exists.

Mailbox providers are getting stricter. Google and Yahoo's 2024 bulk sender requirements explicitly require a DMARC policy of at least `p=none` — but the senders getting the best inbox placement are the ones at `p=reject`. That's not speculation; it's what the data shows when you compare sender reputation scores across authentication configurations.

Get to reject. Take the four-to-eight weeks to do it properly. Your reply rates will thank you.

---

**Related:**
- [Why Your Cold Emails Are Landing in Spam: A Deep Dive into Email Authentication](/blog/why-your-cold-emails-are-landing-in-spam-email-authentication)
- [The Weekly Cold Email Health Check: 7 Things to Review Every Monday](/blog/weekly-cold-email-health-check-review)
- [Why I Stopped Using Google Workspace for Cold Email](/blog/why-i-stopped-using-google-workspace-cold-email)
- 🛠️ [SPF/DKIM/DMARC Checker — Free Tool](/tools/dns-checker)