# Creative Studio — Shopify Store Structure

## Store URL
`shop.creativstudio.co`

---

## Collections

### Print Products (fulfilled by 4over)

| Collection | Handle | Description | Example Products |
|-----------|--------|-------------|-----------------|
| Business Cards | `business-cards` | Premium cards in matte, gloss, soft-touch, silk laminate, and specialty stocks | 16pt gloss, 16pt matte, 32pt ultra-thick, spot UV, foil |
| Flyers & Brochures | `flyers-brochures` | Full-color marketing collateral on premium papers | 8.5x11 flyers, tri-fold brochures, rack cards, door hangers |
| Banners & Signs | `banners-signs` | Indoor/outdoor vinyl banners and rigid signage | 13oz vinyl banners, retractable stands, foam board, coroplast |
| Yard Signs | `yard-signs` | Coroplast signs with optional wire stakes | 18x24 single-sided, 24x36 double-sided, custom sizes |
| Large Format | `large-format` | Posters, canvas, and oversized prints | Posters (up to 44" wide), canvas wraps, mounted prints |
| Stickers & Labels | `stickers-labels` | Die-cut, kiss-cut, and sheet labels | Custom die-cut stickers, roll labels, bumper stickers |

### Promotional Products (fulfilled by Hit Promotional)

| Collection | Handle | Description | Example Products |
|-----------|--------|-------------|-----------------|
| Apparel | `apparel` | Custom-decorated clothing and workwear | T-shirts, polos, hoodies, caps, hi-vis vests |
| Drinkware | `drinkware` | Branded mugs, tumblers, and bottles | Ceramic mugs, stainless tumblers, water bottles |
| Writing Instruments | `writing-instruments` | Promotional pens and stylus pens | Ballpoint pens, stylus combos, marker sets |
| Bags & Totes | `bags-totes` | Custom bags for events and retail | Tote bags, drawstring bags, laptop sleeves |
| Tech & Accessories | `tech-accessories` | Branded tech items and gadgets | USB drives, power banks, phone accessories, webcam covers |
| Corporate Gifts | `corporate-gifts` | Premium branded items for clients and events | Gift sets, awards, padfolios, executive items |

---

## Pages

| Page | Handle | Purpose |
|------|--------|---------|
| About | `about` | Company story, 15+ years, Charlotte-based, production capabilities |
| Contact | `contact` | Address, phone, email, hours, embedded map |
| Shipping & Turnaround | `shipping` | Production timelines by product type, shipping options, rush availability |
| FAQ | `faq` | File requirements, proofing process, bulk pricing, returns/reprints |
| Custom Orders | `custom-orders` | Form for products not in catalog, large quantity RFQs |

---

## Navigation

### Main Menu (Header)

```
Shop All
Print Products >
  ├── Business Cards
  ├── Flyers & Brochures
  ├── Banners & Signs
  ├── Yard Signs
  ├── Large Format
  └── Stickers & Labels
Promo & Apparel >
  ├── Apparel
  ├── Drinkware
  ├── Writing Instruments
  ├── Bags & Totes
  ├── Tech & Accessories
  └── Corporate Gifts
Custom Orders
Contact
```

### Footer Menu

```
Shop All
About
Shipping & Turnaround
FAQ
Contact
← Back to Main Site (creativstudio.co)
```

---

## Homepage Layout (Dawn Sections)

1. **Announcement Bar** — "FREE SHIPPING on orders over $150 | Same-week turnaround on most print products"
2. **Image Banner (Hero)** — Full-width dark background with lime accent headline: "Order Print & Promo Products Online" / subtext: "Same quality. Delivered to your door." / CTA: "Shop Now"
3. **Featured Collection** — "Most Popular" (curated best-sellers across both suppliers)
4. **Collection List** — Grid showing all 12 collections with images
5. **Rich Text Block** — "Why Order From Creative Studio?" with 3 value props (Trade Quality / Fast Turnaround / No Minimums on Select Products)
6. **Image with Text** — Photo of shop + "15+ Years of Commercial Production" brand story
7. **Newsletter Signup** — "Get exclusive pricing and new product alerts"

---

## Product Page Template

Each product page will include:
- Product images (synced from PrintXpand/supplier)
- Title and description
- Variant selector (size, quantity, paper stock / color)
- Price (with wholesale markup applied)
- "Upload Your Design" file upload field (Shopify app or metafield)
- Production time estimate
- "Need help? Call 704-312-0219" trust badge

---

## Pricing Strategy (Markup Rules)

| Category | Wholesale Source | Suggested Markup | Example |
|----------|-----------------|-----------------|---------|
| Business Cards | 4over | 2.5x–3x | $12 wholesale → $30–36 retail |
| Flyers/Brochures | 4over | 2.5x–3x | $25 wholesale → $62–75 retail |
| Banners | 4over | 2x–2.5x | $40 wholesale → $80–100 retail |
| Yard Signs | 4over | 2.5x–3x | $8 wholesale → $20–24 retail |
| Apparel (basic) | Hit Promo | 2x–2.5x | $8 wholesale → $16–20 retail |
| Promo Items | Hit Promo | 2x–3x | $3 wholesale → $6–9 retail |

---

## Shipping Configuration

| Method | Details |
|--------|---------|
| Standard | 5–7 business days (supplier ships direct) |
| Rush | 2–3 business days (rush production + expedited shipping) |
| Local Pickup | Available at 658 Griffith Rd, Charlotte |

All orders fulfilled via blind/drop shipping from supplier warehouse directly to customer. Packaging is white-label (no supplier branding visible).

---

## Apps Required

| App | Purpose | Priority |
|-----|---------|----------|
| PrintXpand Connect | 4over + Hit Promo product sync and order routing | Critical |
| Shopify Email | Email marketing and order notifications | Important |
| Judge.me or Loox | Product reviews | Nice-to-have |
| Uploadery or Product Customizer | Customer file upload for print-ready artwork | Important |

---

## Policies

- **Refund Policy**: Reprints for production defects only. Custom products are non-refundable.
- **Shipping Policy**: Production times vary by product (2–5 business days). Shipping times additional.
- **Terms of Service**: Standard Shopify TOS + custom artwork requirements clause.
- **Privacy Policy**: Standard Shopify-generated.
