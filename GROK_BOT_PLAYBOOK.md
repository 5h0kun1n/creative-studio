# Grok Bot playbook — Creative Studio

Standing rules for Search Console, Business Profile, and anything that needs a Google token.
Tech Cursor chat reviews your work. You cannot message that chat directly.

## Never do this

- Do not retype verification tokens, meta tags, HTML filenames, or DNS TXT values. Characters like `0`/`O` and `1`/`l` will be wrong.
- Do not use GoDaddy / DNS unless the owner explicitly has that login open.
- Do not create a second Google Business Profile.
- Do not change the business name.
- Do not upload Smashburger photos.
- Do not post or invent reviews.

## Always do this with tokens

1. In Search Console, click **Copy**.
2. Paste from the clipboard into the site or into a file. Never type from memory.
3. If you cannot paste onto the live site, send the owner this exact clipboard paste as **plain text** (not a screenshot) and wait. Say: “Paste this into the Tech Cursor chat.”
4. After Tech says it is live, click **Verify** only. Do not generate a new token.

## Search Console (default path — no GoDaddy)

1. Use URL-prefix property: `https://creativstudio.co/`
2. Prefer **HTML tag** or **HTML file**. Do not use Domain TXT unless asked.
3. GTM verify often fails on this site (snippet is not first in `<body>`). Skip GTM if it fails once.
4. After Verify succeeds, Sitemaps → add exactly `sitemap.xml` → Submit.
5. Optional: URL Inspection + Request indexing for `/`, `/quote`, `/services/vehicle-graphics/` only.

## If the token must go on the website

You do not have this Cursor session. Options, in order:

1. If you are logged into GitHub as a repo collaborator: add the meta tag as the **first tag after charset** in `deploy/index.html`, commit, push `master`, wait until `https://creativstudio.co/` source contains the **same** clipboard string, then Verify.
2. If you are not on GitHub: give the owner the clipboard meta tag as plain text for Tech chat. Wait for “tag is live.” Then Verify.

## Business Profile

- Edit the existing Creative Studio listing only.
- Website: `https://creativstudio.co/quote`
- NAP: Creative Studio, 658 Griffith Rd, Ste 119, Charlotte, NC 28217, (704) 312-0219
- Hours: Mon–Fri 7:00 AM–5:00 PM, Sat by appointment, Sun closed
- Category: Sign shop
- Copy the Ask-for-reviews URL and the public Maps URL.

## Report back (plain text the owner pastes into Tech chat)

```
GROK BOT REPORT FOR TECH CHAT
Search Console: property URL, verified?, sitemap status
Business Profile: existing listing edited?, website, NAP, hours, category
Public Maps URL:
Ask-for-reviews URL:
Blockers:
```
