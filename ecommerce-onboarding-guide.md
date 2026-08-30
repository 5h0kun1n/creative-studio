# Creative Studio — E-Commerce Onboarding Guide

Complete these steps in order. Each section tells you exactly what to do, what to click, and includes ready-to-send email templates where needed.

---

## Step 1: Create Your Shopify Store

**Time needed:** 5 minutes

1. Go to [shopify.com](https://www.shopify.com/) and click "Start free trial"
2. Use your business email: `info@creativstudio.co`
3. When asked about your business:
   - Store name: **Creative Studio Shop** (or "Creative Studio" if available)
   - What will you sell: "Print products and promotional items"
   - Are you already selling: "No"
   - Revenue: Select your range
4. Complete signup — you'll land on the Shopify admin dashboard
5. **Important settings to configure immediately:**
   - Go to Settings > Store details:
     - Store name: `Creative Studio`
     - Store contact email: `info@creativstudio.co`
     - Address: 658 Griffith Rd, Ste 119, Charlotte, NC 28217
   - Go to Settings > Payments:
     - Enable Shopify Payments (needs SSN/EIN + bank account)
   - Go to Settings > Checkout:
     - Customer accounts: "Optional"
     - Enable tipping: Off
   - Go to Settings > Shipping:
     - We'll configure this after PrintXpand is connected (suppliers handle shipping)

**Once done, send me your Shopify admin URL (it looks like `your-store.myshopify.com/admin`) and I'll configure the theme.**

---

## Step 2: Connect Your Custom Domain (shop.creativstudio.co)

**Time needed:** 10 minutes

### In Shopify Admin:
1. Go to Settings > Domains
2. Click "Connect existing domain"
3. Enter: `shop.creativstudio.co`
4. Shopify will tell you to add a CNAME record

### In Your DNS Provider:
Add this DNS record:

| Type | Host/Name | Value/Target | TTL |
|------|-----------|-------------|-----|
| CNAME | `shop` | `shops.myshopify.com` | 3600 |

### Back in Shopify:
1. Click "Verify connection" (may take up to 48 hours to propagate, usually 15 min)
2. Once verified, set `shop.creativstudio.co` as your primary domain
3. SSL certificate will be provisioned automatically

---

## Step 3: Install PrintXpand Connect

**Time needed:** 5 minutes

1. In Shopify Admin, go to Apps > Search the Shopify App Store
2. Search for "PrintXpand Connect" (by PrintXpand)
3. Click "Add app" and approve the permissions
4. The app will open its dashboard inside your Shopify admin

**Note:** PrintXpand charges a monthly fee (typically $49–99/mo depending on plan). This is what enables automatic product sync and order routing to 4over and Hit Promo.

---

## Step 4: Sign Up for 4over Reseller Account + API Access

**Time needed:** 15 minutes to apply, 1–3 business days for approval

### 4over Reseller Account:
1. Go to [4over.com](https://www.4over.com/)
2. Click "Register" or "Become a Reseller"
3. Fill in your business details:
   - Business Name: Creative Studio
   - Business Type: Reseller / Print Broker
   - EIN / Tax ID: (your business EIN)
   - Address: 658 Griffith Rd, Ste 119, Charlotte, NC 28217
4. Submit and wait for approval (usually same day to 1 business day)

### Request API Access:
Once your reseller account is approved, send this email:

---

**To:** apisupport@4over.com  
**CC:** support@4over.com  
**Subject:** API Access Request — Creative Studio (Reseller Account)

Hi 4over API Team,

My name is [YOUR NAME] and I'm the owner of Creative Studio (reseller account #[YOUR ACCOUNT NUMBER once approved]).

I'm integrating my Shopify storefront with your production services via PrintXpand Connect and need API credentials to enable automated order submission and product catalog sync.

Could you please provide:
1. API key and secret for our reseller account
2. Documentation for the order submission endpoint
3. Webhook setup instructions for order status updates

Our integration platform: PrintXpand Connect (Shopify app)
Expected volume: 20–50 orders/month initially, scaling from there.

Business details:
- Company: Creative Studio
- Address: 658 Griffith Rd, Ste 119, Charlotte, NC 28217
- Phone: 704-312-0219
- Email: info@creativstudio.co

Please let me know if you need any additional information.

Thank you,
[YOUR NAME]
Creative Studio
704-312-0219

---

### Important 4over Settings (once approved):
- Enable "Blind Shipping" on your account (so packages don't show 4over branding)
- Set default shipping method to "Ground" (you can override per order)
- Request your wholesale price list for most-ordered products

---

## Step 5: Enroll with Hit Promotional for Reseller/API Access

**Time needed:** 15 minutes to apply, 3–5 business days for approval

### Hit Promotional Reseller Account:
1. Go to [hitpromo.net](https://www.hitpromo.net/)
2. Click "Create Account" or "Distributor Login / Register"
3. Register as a **Distributor** (not end-buyer):
   - Business Name: Creative Studio
   - ASI/PPAI Number: (if you have one — not required but speeds approval)
   - Business Type: Promotional products distributor / reseller
4. Submit application

### Request PromoStandards / Data Services Access:
Once your distributor account is approved, send this email:

---

**To:** dataservices@hitpromo.net  
**Subject:** PromoStandards API Access Request — Creative Studio

Hi Hit Promotional Data Services Team,

I'm [YOUR NAME], owner of Creative Studio (distributor account #[YOUR ACCOUNT NUMBER]).

We're building an e-commerce storefront on Shopify using PrintXpand Connect and need to integrate your product catalog and order flow via PromoStandards-compatible APIs.

I'm requesting access to:
1. Product Data Service (catalog sync)
2. Media Content Service (product images)
3. Order Status Service (tracking updates)
4. Inventory Service (real-time stock levels)

Our integration partner: PrintXpand Connect (Shopify app)

Business details:
- Company: Creative Studio
- Address: 658 Griffith Rd, Ste 119, Charlotte, NC 28217
- Phone: 704-312-0219
- Email: info@creativstudio.co
- Distributor Account: #[YOUR ACCOUNT NUMBER]

Please let me know the next steps to get credentials and endpoint URLs.

Thank you,
[YOUR NAME]
Creative Studio
704-312-0219

---

### Important Hit Promo Settings:
- Confirm they support "blind shipping" (most do for distributors)
- Ask about decoration/imprint services (screen printing, embroidery, laser engraving)
- Request their virtual sample tool access if available

---

## Step 6: Connect Vendors in PrintXpand

**Time needed:** 15 minutes (once you have API credentials)

### Connect 4over:
1. Open PrintXpand Connect in your Shopify admin
2. Go to Supplier Connections > Add Supplier
3. Select "4over" from the list (or enter manually)
4. Enter your API key and secret
5. Configure:
   - Default shipping: Ground
   - Blind shipping: Enabled
   - Auto-submit orders: Enabled (or "Review first" if you prefer manual approval)
6. Run initial product sync — this will import their catalog into your Shopify store

### Connect Hit Promotional:
1. In PrintXpand Connect > Supplier Connections > Add Supplier
2. Select "PromoStandards" connection type
3. Enter the endpoint URLs and credentials from Hit Promo's data services team
4. Configure:
   - Sync frequency: Daily
   - Include decoration options: Yes
   - Blind shipping: Enabled
5. Run initial product sync

### Set Markup Rules:
In PrintXpand Connect > Pricing:
- Print Products (4over): 2.5x markup (or set per-category)
- Promotional Items (Hit Promo): 2x markup
- Apparel (Hit Promo): 2.25x markup

**Once vendors are connected and syncing, let me know and I'll map products to collections and finalize the store.**

---

## Checklist Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Create Shopify account | ☐ |
| 2 | Add CNAME record for shop.creativstudio.co | ☐ |
| 3 | Install PrintXpand Connect app | ☐ |
| 4 | Sign up for 4over reseller + request API | ☐ |
| 5 | Sign up for Hit Promo distributor + request API | ☐ |
| 6 | Connect both vendors in PrintXpand | ☐ |

---

## What Happens Next (I Handle This)

Once you complete the steps above and share:
- Your Shopify admin URL
- Confirmation that PrintXpand is installed
- Your 4over and Hit Promo API credentials are entered

I will:
1. Configure the Dawn theme to match your brand exactly (dark background, lime green accents, Inter font)
2. Set up all collections, navigation menus, and pages
3. Configure product display templates
4. Set up the homepage layout with featured products
5. Test the full order flow
6. Final QA and go-live
