# TRACKING.md — Pixel & Conversion Tag Checklist

> Checklist for installing and testing all tracking on creativstudio.co and shop.creativstudio.co.
> Check off each item as you complete it. Test steps included.

---

## Prerequisites (YOU must do these)

- [x] **Create Google Tag Manager account** → tagmanager.google.com
  - Container: `creativstudio.co` → **GTM-PV35GJLJ**
  - Done!

- [x] **Create Meta Pixel** → business.facebook.com → Events Manager
  - Name: `Creative Studio Pixel`
  - Pixel ID: **1086783920528382**
  - Done!

- [x] **Sign up for HubSpot Free CRM** → app.hubspot.com (free)
  - Replaced with **Resend** for email delivery (free tier: 3,000 emails/mo)
  - Resend API key configured in Netlify environment variables
  - Serverless function `submission-created.js` sends branded notification + auto-reply
  - Done!

---

## Step 1: GTM Container Installation

### On creativstudio.co (Netlify)

- [x] Add GTM snippet to `<head>` of every page — installed via **Netlify snippet injection** (2026-08-30)
- [x] Add GTM noscript to `<body>` of every page — installed via **Netlify snippet injection** (2026-08-30)
- [x] The `tracking.js` file handles UTM capture, event helpers, and click-to-call binding

**Test:**
1. Open creativstudio.co in Chrome
2. Install [Tag Assistant](https://tagassistant.google.com/) extension
3. Verify GTM container fires on page load
4. Check: no console errors related to GTM

### On shop.creativstudio.co (Shopify)

- [ ] Shopify Admin → Online Store → Themes → Edit Code → `theme.liquid`
- [ ] Paste GTM `<head>` snippet right after `<head>` tag
- [ ] Paste GTM `<body>` snippet right after `<body>` tag

**Test:** Same Tag Assistant check on shop subdomain.

---

## Step 2: Meta Pixel via GTM

### Base Pixel (PageView)

- [x] In GTM → Tags → New → Custom HTML
- [x] Name: `Meta Pixel - Base`
- [x] Trigger: All Pages
- [x] Published as GTM Version 1 (08/30/2026)
- [x] **VERIFIED LIVE** — PageView events firing on creativstudio.co

```html
<!-- Meta Pixel Base Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1086783920528382');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1086783920528382&ev=PageView&noscript=1"
/></noscript>
```

**Test:**
1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) Chrome extension
2. Visit creativstudio.co → helper should show `PageView` fired
3. Visit shop.creativstudio.co → same check
4. Check Meta Events Manager → Test Events tab → verify events appear

---

## Step 3: Conversion Events via GTM

### QuoteSubmitted (Lead)

- [ ] GTM → Tags → New → Custom HTML
- [ ] Name: `Meta - QuoteSubmitted`
- [ ] Code:
```html
<script>
  fbq('track', 'Lead', {
    content_name: 'quote',
    content_category: 'quote_form'
  });
</script>
```
- [ ] Trigger: **Custom Event** → Event name: `QuoteSubmitted`
  - (This event is pushed to dataLayer by our tracking.js on form submit)

**Test:**
1. Go to /quote page
2. Submit the form with test data
3. Meta Pixel Helper should show `Lead` event
4. Events Manager → Test Events should show `Lead`

### Call (Contact)

- [ ] GTM → Tags → New → Custom HTML
- [ ] Name: `Meta - Call`
- [ ] Code:
```html
<script>
  fbq('track', 'Contact', {
    content_name: 'call'
  });
</script>
```
- [ ] Trigger: **Custom Event** → Event name: `Call`

**Test:**
1. Click the phone number / click-to-call button on any page
2. Meta Pixel Helper should show `Contact` event

### Purchase

- [ ] **Shopify handles this natively** → Shopify Admin → Settings → Customer events
- [ ] Add Meta Pixel ID in Shopify → Settings → Customer events → Add custom pixel
- [ ] OR use Shopify's built-in Meta channel (recommended):
  - Shopify Admin → Sales channels → Add Meta (Facebook & Instagram)
  - Connect your Meta Business Manager
  - This auto-fires `Purchase`, `AddToCart`, `InitiateCheckout`, `ViewContent`

**Test:**
1. Place a test order on Shopify (use Shopify Payments test mode)
2. Check Events Manager for `Purchase` event with correct value

### CompanyStoreStart

- [ ] GTM → Tags → New → Custom HTML
- [ ] Name: `Meta - CompanyStoreStart`
- [ ] Code:
```html
<script>
  fbq('track', 'Lead', {
    content_name: 'company_store'
  });
</script>
```
- [ ] Trigger: **Custom Event** → Event name: `CompanyStoreStart`

---

## Step 4: Google Ads Conversion Tags (when ready)

> Skip this section until you have a Google Ads account.

- [ ] Create Google Ads account at ads.google.com
- [ ] Set up conversion actions:
  - `Quote Submitted` → Category: Lead / Submit lead form
  - `Call` → Category: Lead / Phone call
  - `Purchase` → Category: Purchase / Purchase
- [ ] Get Conversion ID and Label for each action
- [ ] In GTM, create Google Ads Conversion Tracking tags for each
- [ ] Use same triggers as Meta events above

---

## Step 5: UTM Capture Verification

The `tracking.js` script auto-captures UTM parameters from the URL and stores them in hidden form fields + sessionStorage.

**Test:**
1. Visit: `https://creativstudio.co/quote?utm_source=meta&utm_medium=paid&utm_campaign=test_campaign&utm_content=test_ad`
2. Open browser DevTools → Application → Session Storage
3. Verify `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` are stored
4. Submit the quote form
5. Check Netlify Forms dashboard — UTM values should appear in the submission data

---

## Step 6: Click-to-Call Tracking Verification

**Test:**
1. On any page, click the phone number link
2. Check GTM Preview mode → should see `Call` event in dataLayer
3. Meta Pixel Helper should show `Contact` event

---

## Step 7: Thank-You Page Verification

**Test:**
1. Submit quote form → should redirect to `/thank-you?type=quote`
2. On thank-you page, Meta Pixel Helper should show `Lead` event
3. GTM Preview should show `QuoteSubmitted` event in dataLayer
4. In Netlify → Forms → you should see the submission with all fields + UTMs

---

## Conversions API (CAPI) — Phase 2

> Do this after basic pixel tracking is verified and working.

Meta Conversions API sends events server-side, improving match rates when browsers block cookies.

**Options (pick one):**
1. **Shopify Meta Channel** — auto-sends CAPI for shop events (easiest)
2. **GTM Server-Side Container** — requires a cloud server ($10-20/mo)
3. **Stape.io** — managed GTM server-side ($10/mo, simplest for CAPI)

Recommendation: Start with option 1 for shop events. Add option 3 later for quote form events.

---

## Quick Reference: dataLayer Events

These events are pushed by `tracking.js` and can be used as GTM triggers:

```javascript
// Quote form submitted
window.dataLayer.push({
  event: 'QuoteSubmitted',
  formType: 'quote',
  service: 'vehicle_wraps',    // selected service
  timeline: 'within_1_week',   // selected timeline
  utm_source: 'meta',          // from URL
  utm_medium: 'paid',
  utm_campaign: 'campaign_name'
});

// Click-to-call
window.dataLayer.push({
  event: 'Call',
  clickLocation: 'header'      // or 'footer', 'quote_page', etc.
});

// Company store inquiry
window.dataLayer.push({
  event: 'CompanyStoreStart',
  companyName: 'Acme Corp'
});
```

---

*Last updated: 2026-08-30*
