# STATUS.md — Creative Studio Sync Board

> **Both chats read and update this file.**
> This is the single source of truth for what's live, what's in progress, and what's blocked.
> Each chat updates its own section. Read the other section before starting work.

---

## Last sync
- **Tech last updated:** 2026-08-30
- **Marketing last updated:** —

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

## READY FOR MARKETING

| Item | Details |
|------|---------|
| Ad landing URL | `https://creativstudio.co/quote?utm_source=meta&utm_medium=paid&utm_campaign={name}` |
| Meta Pixel | Active — PageView fires on all pages. Lead event fires on /thank-you |
| UTM format | See TECH_HANDOFF.md for full format spec |
| Form fields | name, phone, email, city, service, timeline, photos, message + hidden UTMs |
| Speed-to-lead | Resend emails: ~5 sec delivery to info@creativstudio.co |

## IN PROGRESS (Tech)

| Item | Status | Blocker |
|------|--------|---------|
| Resend domain verification | Not started | Need to add DNS records for creativstudio.co in Resend |
| GTM conversion event tags (Lead, Contact) | Not started | — |
| Shopify store DNS (shop.creativstudio.co) | Not started | Need CNAME added in domain registrar |
| Hit Promo API integration | Waiting | Pending vendor API credentials |
| 4over API integration | Waiting | Need to call 4over for API keys |

## IN PROGRESS (Marketing)

| Item | Status | Blocker |
|------|--------|---------|
| _(Marketing: update this section)_ | | |

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
