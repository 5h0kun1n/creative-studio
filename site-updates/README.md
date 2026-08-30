# Site Updates — Shop Integration

These files add the "Shop" link and online store promotion to your live site at creativstudio.co.

## Files

| File | What It Does |
|------|-------------|
| `components.js` | Updated version of your site's `js/components.js` — adds "Shop" to the header nav and "Shop Online" link in the footer |
| `shop-section.html` | New HTML section to insert into `index.html` — promotes the online store with product category cards |

## How to Deploy

### Option A: If your Netlify site is connected to a GitHub repo

1. Clone the repo locally
2. Replace `js/components.js` with the file from this folder
3. In `index.html`, paste the contents of `shop-section.html` BEFORE the CTA Banner section (the `<section class="py-24 bg-[#A3E635]">` block)
4. Commit and push — Netlify will auto-deploy

### Option B: If you drag-and-drop deploy to Netlify

1. Download/copy your current site files from Netlify (or use the ones you already have)
2. Replace `js/components.js` with the file from this folder
3. In `index.html`, paste the contents of `shop-section.html` BEFORE the CTA Banner section
4. Drag the updated folder into Netlify's deploy interface

### Option C: Let me do it

If you can log into Netlify and share the deploy settings (or connect me to the GitHub repo), I can handle the deployment directly.

## Changes Summary

### Navigation (components.js)
- Added `shopUrl: 'https://shop.creativstudio.co'` to the SITE config
- Added "Shop" link between "Services" and "About Us" in desktop nav (with external link icon)
- Added "Shop Online" link in mobile menu (highlighted in lime green)
- Added "Shop Online" link in footer services column

### Homepage Section (shop-section.html)
- Full-width section with product category cards
- Matches existing design language (dark cards, lime accents, Inter font)
- Responsive grid layout
- Links to shop.creativstudio.co

## Notes
- The shop link opens in a new tab since it's a different domain (Shopify)
- The section uses the same Tailwind classes and custom CSS as the rest of the site
- No additional CSS or JS dependencies needed
