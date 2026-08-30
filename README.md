# Creative Studio — Technical Operations

## Architecture

```
creativstudio.co (Netlify)          shop.creativstudio.co (Shopify)
├── Landing pages                   ├── Product catalog (print + promo)
├── Quote request form              ├── Cart / checkout / payments
├── Thank-you / confirmation        ├── Company stores (password-protected)
├── Portfolio / about               └── Order management
└── Blog (future)
        │                                     │
        └──────── Google Tag Manager ─────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         Meta Pixel  Google Ads  HubSpot
         + CAPI      conv tags   CRM webhook
```

## Stack

| Layer           | Tool                       | Cost     | Status        |
|-----------------|----------------------------|----------|---------------|
| Main site       | Netlify (creativstudio.co) | Free     | Live          |
| Shop            | Shopify Basic              | $39/mo   | Provisioned   |
| Forms           | Netlify Forms              | Free     | To deploy     |
| CRM             | HubSpot Free               | $0       | To sign up    |
| Tag manager     | Google Tag Manager         | $0       | To create     |
| Meta tracking   | Pixel + Conversions API    | $0       | To create     |
| Google tracking | Conversion tags via GTM    | $0       | When ready    |
| Speed-to-lead   | HubSpot + Slack webhook    | $0       | To configure  |
| Call tracking    | Click-to-call JS events    | $0       | To deploy     |
| Promo suppliers | Hit Promo + 4over          | —        | Pending creds |

**Monthly cost: ~$39 (Shopify Basic)**

## Logins / Accounts Needed

| Service             | URL                                              | Who creates |
|---------------------|--------------------------------------------------|-------------|
| Shopify Admin       | admin.shopify.com/store/creative-studio-9720     | Done        |
| Netlify             | app.netlify.com                                  | You         |
| Meta Business Mgr   | business.facebook.com                            | Done        |
| Google Tag Manager  | tagmanager.google.com                            | You         |
| HubSpot CRM         | app.hubspot.com                                  | You         |
| Google Ads           | ads.google.com                                   | When ready  |
| Hit Promo            | hitpromo.net                                     | Done        |
| 4over                | 4over.com                                        | Done        |

## Project Files

| File / Folder             | Purpose                                               |
|---------------------------|-------------------------------------------------------|
| `README.md`               | This file — stack, architecture, how to run            |
| `TECH_HANDOFF.md`         | Event names, URLs, UTM format (for marketing chat)     |
| `TRACKING.md`             | Pixel/tag checklist with test steps                    |
| `site/quote.html`         | Quote request page (deploy to Netlify)                 |
| `site/thank-you.html`     | Post-submission page that fires conversion events      |
| `site/js/tracking.js`     | GTM + Meta Pixel + event helpers + UTM capture         |
| `shopify-theme-config.json` | Shopify Dawn theme brand settings                    |
| `store-structure.md`      | Shopify collections, pages, navigation plan            |
| `dashboard.html`          | Internal business dashboard (local only)               |
| `server.js`               | Local Express server for dashboard + scraper           |

## How to Run (Local Tools)

```bash
# Start the internal dashboard + scraper server
npm install
npm run serve
# Dashboard at http://localhost:3000/dashboard.html

# Run lead scraper
npm run scrape
```

## Deployment

### Netlify (main site)
1. Push `site/` folder contents to your Netlify repo (or drag-drop in Netlify UI)
2. Quote form uses `data-netlify="true"` — works automatically on Netlify
3. Set up email notifications: Netlify Dashboard → Forms → Notifications

### Shopify (shop)
1. Store is at creative-studio-9720.myshopify.com
2. DNS: Add CNAME `shop` → `shops.myshopify.com` in your domain registrar
3. Shopify Admin → Settings → Domains → Add `shop.creativstudio.co`

## Vendor Integration Status

| Vendor    | Account | API Credentials | Integration |
|-----------|---------|-----------------|-------------|
| Hit Promo | Done    | Requested       | Pending     |
| 4over     | Done    | Need to call    | Pending     |

## Order Routing (documented, not over-engineered)

```
Customer order comes in
  ├── Promo product (pens, mugs, apparel) → Route to Hit Promo / 4over
  ├── Standard print (cards, flyers, banners) → Route to 4over
  └── Custom work (signs, wraps, 3D lettering) → Internal production / partners
```

Routing is manual for now (check Shopify orders, forward to correct supplier).
Automate later with Shopify Flow or PrintXpand when supplier APIs are connected.
