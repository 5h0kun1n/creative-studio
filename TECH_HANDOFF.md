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
| Privacy             | https://creativstudio.co/privacy              | Live       |
| Services index      | https://creativstudio.co/services/            | Live 2026-09-12 |
| Vehicle wraps       | https://creativstudio.co/services/vehicle-graphics/ | Live 2026-09-12 |
| Signs & 3D letters  | https://creativstudio.co/services/signage-3d-letters/ | Live 2026-09-12 |
| Storefront/windows  | https://creativstudio.co/services/storefront-graphics/ | Live 2026-09-12 |
| Commercial printing | https://creativstudio.co/services/commercial-printing/ | Live 2026-09-12 |
| Promo & apparel     | https://creativstudio.co/services/promo-apparel/ | Live 2026-09-12 |
| About               | https://creativstudio.co/about/               | Live 2026-09-12 |
| Contact             | https://creativstudio.co/contact/             | Live 2026-09-12 |
| Sitemap             | https://creativstudio.co/sitemap.xml          | Live 2026-09-12 |
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

## Meta Ads Integration (Pipeboard MCP) — for Marketing Cursor

Marketing can read and manage Meta Ads directly from Cursor using the **Pipeboard Meta Ads MCP**.
This is already working on the Tech PC. Marketing needs to set it up on their machine.

### Step-by-step setup (Marketing PC)

1. **Open MCP config file:**
   - In Cursor, open the file `C:\Users\<YOUR_USERNAME>\.cursor\mcp.json`
   - If the file doesn't exist, create it

2. **Paste this config** (merge with any existing entries):
   ```json
   {
     "mcpServers": {
       "meta-ads-remote": {
         "url": "https://meta-ads.mcp.pipeboard.co/"
       }
     }
   }
   ```

3. **Restart Cursor** (close and reopen — reload is not enough)

4. **Authenticate:**
   - After restart, Cursor will show the MCP server in Settings → MCP
   - The first time you use a Meta Ads tool, Cursor will open an OAuth login in the browser
   - Log in with the **same Facebook account** that manages the Creative Studio ad account
   - Authorize Pipeboard to access Meta Ads data

5. **Verify it works — ask Cursor:**
   > "List my Meta ad accounts"
   
   You should see the Creative Studio ad account. Then try:
   > "Show me performance for my active campaigns in the last 7 days"

### What Marketing can do once connected

| Action | Example prompt |
|--------|---------------|
| **View campaign performance** | "Show me CPC, CPL, and spend for all active campaigns this week" |
| **Check ad set details** | "Break down the fleet form campaign by age and gender" |
| **View ad creatives** | "Show me which ad creatives are running and their CTR" |
| **Get audience insights** | "What audiences am I targeting in my active campaigns?" |
| **Create campaigns** | "Create a new Meta campaign targeting Charlotte +25mi, $30/day, leads objective" |
| **Pause/enable ads** | "Pause the underperforming ad set in my fleet campaign" |
| **Duplicate campaigns** | "Duplicate my fleet form campaign with a $50/day budget" |
| **Search interests** | "Find Meta targeting interests related to small business owners" |
| **Estimate audience size** | "How big is the audience for fleet managers in Charlotte NC?" |

### Ad account details (for reference)

| Item | Value |
|------|-------|
| Meta Pixel ID | `1086783920528382` |
| GTM Container | `GTM-PV35GJLJ` |
| MCP endpoint | `https://meta-ads.mcp.pipeboard.co/` |

### Troubleshooting

- **"MCP server not connected"** → Restart Cursor fully (not just reload)
- **Auth popup doesn't appear** → Go to Cursor Settings → MCP → click the refresh icon next to `meta-ads-remote`
- **Wrong ad account** → You may have multiple ad accounts. Ask: "List all my ad accounts" and specify which one to use
- **Can't write/create** → Pipeboard free tier supports reads and writes. If write fails, check that the Facebook user has admin access on the ad account

### Future upgrade: Ryze AI (when ready for Google Ads)

When Creative Studio starts running Google Ads, we can add Ryze AI MCP alongside or instead of Pipeboard.
Ryze covers Meta Ads + Google Ads + GA4 + Search Console + Shopify in one endpoint.
Free tier available. See Tech for setup when the time comes.

---

## SEO notes for Marketing (2026-09-12)

- Homepage title now includes **Charlotte, NC**. All quote CTAs go to `/quote` (old `/contact` 404s are gone).
- New service pages are valid landing URLs for search and for future website campaigns. Optional quote preselect: `/quote?service=vehicle_wraps` (also `custom_signs`, `3d_lettering`, `storefront_window`, `banners`, `promo_products`).
- **Owner still needs to:** add the sitemap in [Google Search Console](https://search.google.com/search-console) (`https://creativstudio.co/sitemap.xml`), finish the Google Business Profile audit, and ask customers for Google reviews. That work is not in this repo.

---

*Last updated: 2026-09-12*
