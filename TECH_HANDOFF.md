# TECH_HANDOFF.md — Creative Studio

> **Owner: Tech chat. Marketing reads this.**
> Tech: update this file whenever you ship something new.
> Marketing: read this before every session. Do not edit — put requests in MARKETING_REQUESTS.md.

---

## Live URLs

| Page                | URL                                           | Status     |
|---------------------|-----------------------------------------------|------------|
| Main site           | https://creativstudio.co                      | Live       |
| Quote form          | https://creativstudio.co/quote                | Live (verified 2026-08-30) |
| Thank-you page      | https://creativstudio.co/thank-you            | Live (verified 2026-08-30) |
| Shop                | https://shop.creativstudio.co                 | DNS pending|
| Shop (temp)         | https://creative-studio-9720.myshopify.com    | Live       |

---

## Tracking Event Names

Use these EXACT names in all reporting and ad platform configuration.

| Event               | Fires when                                      | Platform          |
|---------------------|------------------------------------------------|-------------------|
| `QuoteSubmitted`    | User submits the quote request form             | GTM → Meta, GAds  |
| `Call`              | User taps click-to-call or tel: link            | GTM → Meta, GAds  |
| `Purchase`          | Shopify checkout complete                       | Shopify → Meta    |
| `CompanyStoreStart` | Client begins company store setup/inquiry       | GTM → Meta        |
| `PageView`          | Every page load (automatic via Meta Pixel)      | Meta Pixel        |
| `ViewContent`       | Product page or service page view               | GTM → Meta        |
| `AddToCart`         | Shopify add-to-cart                             | Shopify → Meta    |
| `InitiateCheckout`  | Shopify checkout start                          | Shopify → Meta    |

### Meta Pixel Standard Event Mapping

| Our event           | Meta standard event    | Custom param          |
|---------------------|------------------------|----------------------|
| `QuoteSubmitted`    | `Lead`                 | `content_name: "quote"` |
| `Call`              | `Contact`              | `content_name: "call"` |
| `Purchase`          | `Purchase`             | `value`, `currency`  |
| `CompanyStoreStart` | `Lead`                 | `content_name: "company_store"` |

---

## UTM Format

All paid links MUST use this format:

```
?utm_source={platform}&utm_medium={type}&utm_campaign={campaign_name}&utm_content={ad_name}&utm_term={keyword_or_audience}
```

### Examples

| Channel       | utm_source  | utm_medium | utm_campaign           |
|---------------|-------------|------------|------------------------|
| Meta Ads      | `meta`      | `paid`     | `vehicle_wraps_q3`     |
| Google Ads    | `google`    | `cpc`      | `signs_charlotte`      |
| Google Local  | `google`    | `local`    | `gbp_profile`          |
| Email blast   | `email`     | `email`    | `summer_promo_2026`    |
| Organic social| `instagram` | `organic`  | `post_aug2026`         |

### Meta Ads URL Template

```
https://creativstudio.co/quote?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

### Google Ads URL Template

```
https://creativstudio.co/quote?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}
```

---

## Quote Form Fields

The quote form at `/quote` collects:

| Field         | Type           | Required | Notes                            |
|---------------|----------------|----------|----------------------------------|
| `name`        | text           | Yes      |                                  |
| `phone`       | tel            | Yes      |                                  |
| `email`       | email          | Yes      |                                  |
| `service`     | select         | Yes      | See options below                |
| `city`        | text           | Yes      | Pre-filled "Charlotte" default   |
| `timeline`    | select         | No       | See options below                |
| `photos`      | file (multi)   | No       | Up to 5 images, 10MB each       |
| `message`     | textarea       | No       |                                  |
| `utm_source`  | hidden         | —        | Auto-captured from URL           |
| `utm_medium`  | hidden         | —        | Auto-captured from URL           |
| `utm_campaign`| hidden         | —        | Auto-captured from URL           |
| `utm_content` | hidden         | —        | Auto-captured from URL           |
| `utm_term`    | hidden         | —        | Auto-captured from URL           |
| `landing_page`| hidden         | —        | Auto-captured: current URL       |

### Service Type Options

- Vehicle Wraps
- Custom Signs
- Vinyl Lettering / Decals
- 3D Lettering
- Storefront / Window Graphics
- Banners & Displays
- Fleet Branding
- Promotional Products
- Company Store Setup
- Other

### Timeline Options

- ASAP / Rush
- Within 1 week
- Within 2 weeks
- Within a month
- No rush / just exploring

---

## CRM Fields

When a quote comes in, these fields populate in HubSpot (or current CRM):

- Contact: name, email, phone, city
- Deal: service type, timeline, message, photos (as attachments)
- Attribution: utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_page
- Timestamp: submission date/time

---

## Confirmation / Thank-You Pages

| Trigger           | Redirect to                              | Events fired           |
|-------------------|------------------------------------------|------------------------|
| Quote form submit | `/thank-you?type=quote`                  | `QuoteSubmitted` (Lead)|
| Shopify purchase  | Shopify order confirmation + custom JS    | `Purchase`             |
| Company store form| `/thank-you?type=company_store`          | `CompanyStoreStart`    |

---

## Notification Flow (Speed-to-Lead)

```
Form submitted
  → Netlify Forms captures data
  → Email to info@creativstudio.co (immediate)
  → Slack webhook ping (immediate, when configured)
  → HubSpot contact created (via Zapier or HubSpot form, when configured)
```

Target: lead sees a response within 5 minutes during business hours.

---

## DNS Records Needed

| Type  | Host   | Value                    | Purpose                  |
|-------|--------|--------------------------|--------------------------|
| CNAME | `shop` | `shops.myshopify.com`    | Shopify store subdomain  |

---

## Pixels / Tags to Install

See `TRACKING.md` for the full checklist.

| Tag                  | Where                | Container |
|----------------------|----------------------|-----------|
| GTM container        | creativstudio.co     | GTM       |
| GTM container        | shop.creativstudio.co| GTM       |
| Meta Pixel base      | Both (via GTM)       | GTM       |
| Meta CAPI            | Server-side (later)  | GTM SS    |
| Google Ads tag       | Both (via GTM)       | GTM       |

---

*Last updated: 2026-08-30*
