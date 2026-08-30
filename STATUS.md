# STATUS.md — Creative Studio Sync Board

> **Both chats read and update this file.**
> This is the single source of truth for what's live, what's in progress, and what's blocked.
> Each chat updates its own section. Read the other section before starting work.

---

## Last sync
- **Tech last updated:** 2026-08-30 (GTM conversion tags published — Lead + Contact live)
- **Marketing last updated:** 2026-08-30

---

## LIVE (deployed and working)

| Component | URL / ID | Date shipped |
|-----------|----------|-------------|
| Main site | https://creativstudio.co | Pre-existing |
| Quote form | https://creativstudio.co/quote | 2026-08-30 |
| Thank-you page | https://creativstudio.co/thank-you | 2026-08-30 |
| GTM container | GTM-PV35GJLJ (on all pages via snippet injection) | 2026-08-30 |
| Meta Pixel | 1086783920528382 (PageView on all pages via GTM) | 2026-08-30 |
| Resend email notifications | Branded lead alert + customer auto-reply | 2026-08-30 |
| Netlify Forms | Quote form capture + email notification | 2026-08-30 |
| UTM tracking | Auto-captured in form submissions | 2026-08-30 |
| tracking.js | GTM loader + UTM capture + event helpers | 2026-08-30 |
| CTA buttons | "Get a Free Quote" → /quote on all pages | 2026-08-30 |
| GTM: Meta - QuoteSubmitted | Lead event via Custom HTML + CE - QuoteSubmitted trigger | 2026-08-30 |
| GTM: Meta - Call | Contact event via Custom HTML + CE - Call trigger | 2026-08-30 |

## READY FOR MARKETING

| Item | Details |
|------|---------|
| Ad landing URL | `https://creativstudio.co/quote?utm_source=meta&utm_medium=paid&utm_campaign={name}` |
| Meta Pixel | Active — PageView fires on all pages. **Lead fires on QuoteSubmitted, Contact fires on Call (published 2026-08-30).** |
| UTM format | See TECH_HANDOFF.md for full format spec |
| Form fields | name, phone, email, city, service, timeline, photos, message + hidden UTMs |
| Speed-to-lead | Resend emails: ~5 sec delivery to info@creativstudio.co |

## IN PROGRESS (Tech)

| Item | Status | Blocker |
|------|--------|---------|
| Resend domain verification | Not started | Need to add DNS records for creativstudio.co in Resend |
| GTM conversion event tags (Lead, Contact) | **LIVE** — published as GTM v2 (2026-08-30) | — |
| SMS lead notifications | Not started (owner approved) | — |
| Shopify store DNS (shop.creativstudio.co) | Not started | Need CNAME added in domain registrar |
| tracking.js on homepage | Code done, needs Netlify redeploy | — |
| Hit Promo API integration | Waiting | Pending vendor API credentials |
| 4over API integration | Waiting | Need to call 4over for API keys |

## IN PROGRESS (Marketing)

| Item | Status | Blocker |
|------|--------|---------|
| `CS-META-SIGNS-CALL-V00b` — Meta Calls campaign, $45 lifetime, Charlotte +25mi, age 25+, dayparted Mon–Fri 9am–6pm | Built as draft in Ads Manager. Launches **Mon Aug 31**, ends **Sep 3**. | Final ad image — see next row |
| Ad creative selection | Choosing between `recent-fleet.JPEG` (Deluxe truck) and `recent-3dletters.jpg` (R&R Rentals) from `deploy/assets/images/` | **Needs Tech/Owner answer:** are these cleared for use in paid ads? See Q1 in `MARKETING_REQUESTS.md` |
| Google Business Profile optimisation | Profile exists and is verified, category `Sign shop`. Audit + reviews + services/description work queued. | None — free channel, proceeding |
| Weekly scorecard + call log | Live. Every caller is asked "Google or Facebook?" because GBP and Meta both ring the same phone. | None |
| Q4 corporate apparel outreach | Starts Fri Sep 4 | Production lead times unconfirmed |
| Meta Leads campaign → `/quote` | **UNBLOCKED + VERIFIED** — Lead event confirmed in Events Manager Test Events (2026-08-30 3:31 PM, status: Processed). Ready for conversion campaigns. | — |

> **Marketing P0 fully resolved (Tech, 2026-08-30):** All conversion tags published in GTM v2 and `Lead` event verified in Events Manager → Test Events (Processed at 3:31 PM). Marketing is clear to build conversion-objective campaigns.

## BLOCKED

| Item | Blocked by | Who resolves |
|------|-----------|-------------|
| Hit Promo integration | Waiting on PromoStandards API credentials from Hit Promo | Owner (follow up with vendor) |
| 4over integration | Need to call 4over for API keys | Owner (call vendor) |
| Resend custom sender | Need DNS records verified in Resend | Tech (next session) |

## DECISIONS NEEDED

| Question | Context | Who decides |
|----------|---------|------------|
| HubSpot CRM? | Currently using Resend + Netlify Forms. HubSpot adds deal pipeline, lead scoring. Worth adding? | Owner |

---

## File ownership reference

| File | Owner | Other chat |
|------|-------|-----------|
| `TECH_HANDOFF.md` | Tech writes | Marketing reads |
| `MARKETING_REQUESTS.md` | Marketing writes | Tech reads |
| `STATUS.md` | Both update own sections | Both read |
| `TRACKING.md` | Tech writes | Marketing reads |
| `README.md` | Tech writes | Reference only |

---

### Instructions for each Cursor chat

**Tech chat — start of every session:**
1. Read `MARKETING_REQUESTS.md` for new requests
2. Read `STATUS.md` for current state
3. Build what's needed
4. Update `TECH_HANDOFF.md` with new URLs/events/fields
5. Update `STATUS.md` with what shipped

**Marketing chat — start of every session:**
1. Read `TECH_HANDOFF.md` for available URLs, events, UTM format
2. Read `STATUS.md` for what's live and what's blocked
3. Write campaign needs in `MARKETING_REQUESTS.md`
4. Update `STATUS.md` → "IN PROGRESS (Marketing)" section
