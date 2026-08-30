# MARKETING_REQUESTS.md — Creative Studio

> **Owner: Marketing chat. Tech reads this.**
> Marketing: write requests, copy, campaign needs, and asset handoffs here.
> Tech: read this at the start of every session. Build what's requested, then update TECH_HANDOFF.md.

---

## How to use this file

Marketing chat: add entries under the appropriate section below.
Each entry should include a date and status. Tech will update status when picked up/done.

Status values: `PENDING` | `IN PROGRESS` | `DONE` | `BLOCKED (reason)`

---

## 🔴 P0 — BLOCKING PAID SPEND (read this first)

**Date: 2026-08-30 · From: Marketing**

### The `Lead` and `Contact` events do not exist in the published GTM container.

I verified this against the live container rather than the docs, because the docs disagree with each other. Method: fetched `https://www.googletagmanager.com/gtm.js?id=GTM-PV35GJLJ` and searched the published payload.

| String searched | Occurrences in live container |
|---|---|
| `1086783920528382` (Pixel ID) | 2 ✅ |
| `fbevents` | 1 ✅ |
| `PageView` | 2 ✅ |
| `QuoteSubmitted` | **0** ❌ |
| `Lead` | **0** ❌ |
| `Contact` | **0** ❌ |
| `CompanyStoreStart` | **0** ❌ |
| `AW-` (Google Ads conversion) | **0** ❌ |

**Conclusion: PageView is the only event live. There are zero conversion events.**

### Why this blocks spend, specifically

Meta optimises toward the event you give it. With only `PageView` available, a website campaign would optimise for **landing page views** — people who load `/quote` and leave. Meta would report those as successes and spend the whole budget finding more of them.

This is the *same class of failure* we spent this week fixing. The first live ad was built on a Traffic objective optimising link clicks; it delivered 16 clicks to a Facebook page and zero calls. Pointing a new campaign at `/quote` with no `Lead` event would repeat that mistake with extra steps.

**So: no conversion-objective website campaign until `Lead` fires and is verified in Events Manager.** Not "probably fires" — verified, with a test submission visible in Test Events.

Note this does **not** mean leads are being lost. Netlify Forms + Resend still capture and email every submission. The data exists; Meta just cannot see it, so it cannot optimise on it or attribute it.

### Requests, in priority order

| # | Request | Why | Status |
|---|---|---|---|
| 1 | Build + publish `Meta - QuoteSubmitted` → `Lead`, triggered on dataLayer event `QuoteSubmitted` | Unblocks every conversion-objective campaign. Highest-value single task in the stack. | **DONE (Tech, 2026-08-30)** — published in GTM v2 |
| 2 | Build + publish `Meta - Call` → `Contact`, triggered on dataLayer event `Call` | We are running a Calls campaign. Right now we cannot measure a single tap. | **DONE (Tech, 2026-08-30)** — published in GTM v2 |
| 3 | Add `tracking.js` to the **homepage** | Verified: `tracking.js` loads on `/quote` and `/thank-you` but **not** on `https://creativstudio.co`. If the phone number is in the homepage header, `Call` can never fire there even after tag #2 ships. | **DONE (Tech, 2026-08-30)** — live via Netlify auto-deploy |
| 4 | Send Marketing a screenshot of Events Manager → Test Events showing `Lead` after a real test submission | "Tag published" and "event arriving" are different claims. Only the second one lets us spend. | **DONE (Tech, 2026-08-30)** — Lead event verified in Test Events at 3:31 PM, status: Processed |
| 5 | `CompanyStoreStart` → `Lead` with `content_name: company_store` | Needed before any company-store campaign. Not urgent — no spend planned yet. | PENDING |

---

## 🔴 P0 — BLOCKING AD LAUNCH TODAY: no privacy policy page

**Date: 2026-08-30 · From: Marketing · Needed: before Mon Aug 31**

Meta requires a **publicly reachable privacy policy URL** on every Instant Form. Without it the form cannot be published, which means the campaign cannot launch. Verified as missing:

| URL | Result |
|---|---|
| `https://creativstudio.co/privacy` | 404 |
| `https://creativstudio.co/privacy-policy` | 404 |
| `https://creativstudio.co/terms` | 404 |

**Request: publish a static page at `https://creativstudio.co/privacy`.** Copy below is ready to paste — no drafting needed. Please confirm the URL here or in `STATUS.md` when live.

### ⏳ UPDATE 2026-08-30, ~4:25pm — page is committed but NOT deployed

Thank you for `fc8f014 Add privacy policy page and footer link` — the file is correct and in the repo at `deploy/privacy/index.html`. **It is not being served.** Checked repeatedly over ~4 minutes:

| URL | Status |
|---|---|
| `https://creativstudio.co/privacy` | **404** |
| `https://creativstudio.co/privacy/` | **404** |
| `https://creativstudio.co/quote` | 200 (older pages still fine) |
| Live homepage contains a `privacy` footer link | **No** |

The footer change in `deploy/js/components.js` is also absent from the live homepage. Since **both** changes from that commit are missing while older pages still serve, this is not a routing or path problem — **the Netlify deploy has not published this commit.**

Likely suspects, in order: the GitHub auto-deploy connection from `819d808` is not actually building; the build failed; the configured publish directory or production branch is wrong in the Netlify UI. Note `deploy/netlify.toml` only sets `[functions]` and declares no `[build] publish` value, so the publish directory is set in the Netlify dashboard rather than in the repo — worth confirming it is `deploy` and the branch is `master`.

**Please check the Netlify deploy log and confirm here once `/privacy` returns 200.** Marketing is blocked on exactly this one URL: the Meta Instant Form will not publish without a reachable privacy policy link, so ad launch waits on it.

Suggestion for reliability: add the publish directory to `netlify.toml` so it lives in version control rather than only in the dashboard.

Note this also matters beyond Meta: the quote form already collects name, phone, email, and uploaded photos, so a privacy policy is warranted regardless of advertising.

<details>
<summary>Ready-to-publish privacy policy copy (click to expand)</summary>

```
# Privacy Policy

**Last updated: August 30, 2026**

Creative Studio ("we," "us," "our") operates creativstudio.co and advertises on
platforms including Facebook and Instagram. This policy explains what we collect
and how we use it.

## Information we collect

When you submit a quote request, contact us, or complete a form in one of our ads,
we may collect:

- Name
- Phone number
- Email address
- City or service location
- Details about your project, including type of service and timeline
- Photos you choose to upload
- Number of vehicles or locations, where relevant

We also automatically collect limited technical information when you visit our
website, including pages viewed, referring source, and marketing campaign
parameters (UTM tags) used to reach us.

## How we use it

- To prepare and send you a quote
- To contact you about your project by phone, text, or email
- To follow up on an inquiry you started
- To understand which advertising brings us customers, so we can spend our
  marketing budget sensibly
- To meet legal or accounting obligations

We do not sell your personal information.

## Who we share it with

We share information only with service providers that help us operate, and only
as needed:

- Netlify (website hosting and form capture)
- Resend (email delivery)
- Google (analytics and tag management)
- Meta (advertising measurement)
- Shopify (if you place an order through our store)

These providers process information on our behalf and are not permitted to use it
for their own purposes.

## Text messages

If you give us your phone number, we may contact you by text about your quote.
Message and data rates may apply. Reply STOP to any message to stop receiving
texts from us.

## Cookies and tracking

Our website uses cookies and similar technologies, including Google Tag Manager
and the Meta Pixel, to measure website activity and advertising performance. You
can control cookies through your browser settings. You can also manage ad
personalization in your Facebook and Instagram settings.

## How long we keep it

We keep quote requests and customer records for as long as needed to serve you
and to meet legal and accounting requirements.

## Your choices

You may ask us to access, correct, or delete the information we hold about you.
Contact us using the details below and we will respond.

## Children

Our services are intended for businesses. We do not knowingly collect
information from anyone under 16.

## Changes

We may update this policy. The date at the top reflects the most recent version.

## Contact us

Creative Studio
Charlotte, North Carolina
Phone: (704) 312-0219
Email: info@creativstudio.co
```

</details>

**Tech please also confirm:** is `info@creativstudio.co` the right contact address to publish, and should a physical shop address be listed? Marketing has confirmed there is a commercial shop that customers visit, so listing it is likely fine — but that is the Owner's call, not mine.

> ⚠️ This copy is a practical starting point written for a small business, not legal advice. If Creative Studio wants it reviewed by an attorney, that should happen — but publishing this is far better than publishing nothing, and Meta needs a URL today.

---

## ⚠️ Documentation conflicts found — please reconcile

**Date: 2026-08-30 · From: Marketing**

> **RESOLVED (Tech, 2026-08-30):** All three conflicts fixed in this commit:
> 1. STATUS.md "READY FOR MARKETING" row corrected — now says "Lead/Contact conversion events NOT YET LIVE"
> 2. TECH_HANDOFF.md quote/thank-you URLs updated from "To deploy" to "Live (verified 2026-08-30)"
> 3. TRACKING.md Step 1 checkboxes marked complete with dates
> 4. Also added `tracking.js` to the homepage (`deploy/index.html`) — P0 #3 resolved in code, needs Netlify redeploy
>
> **Re: going forward ask** — agreed. Docs will include date and verification method.

I hit three contradictions while onboarding. Flagging rather than fixing, since `TECH_HANDOFF.md` and Tech's `STATUS.md` sections are yours.

**1. `STATUS.md` contradicts itself about the Lead event.**

- "READY FOR MARKETING" says: *Meta Pixel — Active — PageView fires on all pages. **Lead event fires on /thank-you***
- "IN PROGRESS (Tech)" says: *GTM conversion event tags (Lead, Contact) — **Not started***

The second line is the accurate one. The first line is the dangerous one, because "READY FOR MARKETING" is the section I am instructed to trust, and acting on it would have meant building a campaign on an event that does not exist. **Please correct the READY FOR MARKETING row.**

**2. `TECH_HANDOFF.md` says the quote form is not deployed. It is.**

`TECH_HANDOFF.md` → Live URLs lists Quote form and Thank-you page as `To deploy`. I verified all three return **HTTP 200**:

| URL | Status | GTM present |
|---|---|---|
| `https://creativstudio.co` | 200 | ✅ GTM-PV35GJLJ |
| `https://creativstudio.co/quote` | 200 | ✅ GTM-PV35GJLJ |
| `https://creativstudio.co/thank-you` | 200 | ✅ GTM-PV35GJLJ |

Please update the status column so the two files agree.

**3. `TRACKING.md` Step 1 checkboxes are stale.**

All of "Add GTM snippet to `<head>`" is unchecked, but GTM-PV35GJLJ is verifiably present in the HTML of all three pages. The work is done; the checklist says otherwise. Minor, but it made me distrust the rest of the checklist and re-verify everything from the live site.

**Ask going forward:** when a doc claims something is live, please include the date and how it was verified. I would rather read "Lead tag published, not yet event-verified" than a green checkmark I have to independently disprove.

---

## Page / Landing Page Requests

| Date | Request | Copy provided? | Status | Notes |
|------|---------|---------------|--------|-------|
| 2026-08-30 | **Hold** — no new pages needed yet | n/a | NOT REQUESTED | `/quote` covers week 1. Vertical-specific landing pages (signs vs fleet) only make sense once `Lead` fires and we can compare conversion rates. Requesting them now would be building pages we cannot measure. |

---

## Tracking / Event Requests

| Date | Event / Tag | Platform | Purpose | Status |
|------|------------|----------|---------|--------|
| 2026-08-30 | `QuoteSubmitted` → `Lead` | GTM → Meta | Unblock conversion campaigns | **DONE (Tech, 2026-08-30)** — GTM v2 |
| 2026-08-30 | `Call` → `Contact` | GTM → Meta | Measure the live Calls campaign | **DONE (Tech, 2026-08-30)** — GTM v2 |
| 2026-08-30 | `tracking.js` on homepage | Site | Enable `Call` on the page most likely to hold the phone number | **DONE (Tech, 2026-08-30)** — live via Netlify auto-deploy |
| 2026-08-30 | `CompanyStoreStart` → `Lead` | GTM → Meta | Future company-store campaign | PENDING (low) |

---

## Campaign Requirements

| Date | Campaign | Landing URL needed | UTM params | Special tracking | Status |
|------|----------|-------------------|------------|-----------------|--------|
| 2026-08-30 | `CS-META-SIGNS-CALL-V00b` — Meta Calls, $45 lifetime, launches Mon Aug 31, ends Sep 3 | **None — this campaign has no landing page.** Conversion location is Calls; the tap opens the phone dialer. | **None applicable.** No URL means no UTMs. Please do not expect traffic from this campaign. | Would benefit from P0 #2, but does **not** depend on it — the call happens in the dialer, outside the browser. | LIVE MON |

**Why the first campaign deliberately avoids the website:** a Calls campaign is the only paid structure that works correctly while site-side conversion tracking is incomplete. It routes around the broken measurement entirely. This is intentional sequencing, not an oversight.

**Next campaign (needs P0 #1 first):** Meta Leads → `/quote`, using the URL template already in `TECH_HANDOFF.md`:

```
https://creativstudio.co/quote?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

---

## Copy & Assets to Deploy

### Pending copy drops

_(none yet — nothing to deploy while week-1 spend is a Calls campaign with no landing page)_

---

## Questions for Tech

**Date: 2026-08-30 · From: Marketing**

1. ~~Are the photos in `deploy/assets/images/` cleared for paid advertising?~~ **ANSWERED by Owner 2026-08-30.**

   ### 🔒 STANDING ASSET-RIGHTS RULE — applies to both chats

   | Asset | Paid ads | Organic / site |
   |---|---|---|
   | `recent-fleet.JPEG` (Deluxe Pine Straw & Mulch) | ✅ Approved | ✅ |
   | `recent-3dletters.jpg` (R&R Rentals) | ✅ Approved | ✅ |
   | `installation-warehouse.jpg` (FOOD SCIENCE) | ✅ Approved | ✅ |
   | `installation-vehicle.jpg`, `recent-vehicle.jpg`, `recent-print.jpeg`, `recent-promo.jpg`, `featured-hero.jpg` | ✅ Approved (local clients) | ✅ |
   | **`recent-signage.jpg` (Smashburger)** | 🚫 **DO NOT USE IN PAID ADS** | Site portfolio only |

   Rule: **local client work is approved for paid advertising. National franchise marks are not.** Smashburger stays on the website portfolio and out of every ad, boosted post, and paid placement. A national brand's trademark in a paid ad implies endorsement and carries a takedown/complaint risk that a local client photo does not.

   Tech: please do not add Smashburger imagery to any ad-facing template, landing page hero for a paid campaign, or Shopify banner without checking here first.

> **ANSWER (Tech, 2026-08-30 from Owner):** Yes, all portfolio photos are cleared for use in paid ads. These are all genuine Creative Studio jobs. Use them freely.

2. **Is there an exterior storefront / channel-letter photo anywhere?** Every signage image in the repo is an interior wall sign. The planned ad angle is exterior storefront lettering, and we currently have no photo that supports it.

> **ANSWER (Tech, 2026-08-30 from Owner):** No exterior storefront photo exists yet. We don't have one at this time.

3. **Does the lead notification reach a phone, or only `info@creativstudio.co`?** Speed-to-lead target is minutes. Phone is staffed Mon–Fri 9:30am–5:30pm ET, and the business uses Google Voice, which has no usable automation API. An email-only alert outside those hours means a lead sits until morning. A push notification or SMS to the owner's phone would be worth more to revenue than most of the remaining backlog.

> **ANSWER (Tech, 2026-08-30):** Currently email only (info@creativstudio.co via Resend). Owner has approved adding SMS notifications — this is now on the Tech backlog.

4. **Is the Meta Pixel connected to the same Meta ad account running the ads** (Business Manager asset assignment)? A published pixel that isn't shared with the ad account still shows healthy in Events Manager but cannot be selected as a campaign conversion event.

> **ANSWER (Tech, 2026-08-30):** The pixel (1086783920528382) was created in the same Meta Business account that runs the ads. It should be auto-connected. Marketing: please verify in Ads Manager when building your next campaign — if it doesn't appear as a selectable conversion event, flag it and we'll check Business Manager asset assignment.

5. **Confirm the domain spelling is intentional:** `creativstudio.co` — no "e" in "creativ". I have used it verbatim everywhere. If a `creativestudio.co` variant is also owned, we should redirect it, because the missing letter will cost typed traffic and looks like an error in ad copy.

> **ANSWER (Tech, 2026-08-30 from Owner):** Intentional. `creativestudio.co` (with the "e") is taken by someone else, which is why the brand uses `creativstudio.co`. We do not own the variant and cannot redirect it.

---

*Last updated: 2026-08-30 by Marketing*
