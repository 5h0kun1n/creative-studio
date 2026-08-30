const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const PROSPECTS_FILE = path.join(DATA_DIR, 'auto-prospects.json');

const SCRAPERS = {
    ncsos: scrapeNCBusinessFilings,
    yelp: scrapeYelp,
    google: scrapeGoogleMaps,
};

// ==================== NC Secretary of State — New Business Filings ====================

async function scrapeNCBusinessFilings(browser) {
    console.log('\n--- NC Secretary of State: New Business Filings (Mecklenburg, last 7 days) ---');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
    const prospects = [];

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fmt = (d) => `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;

    try {
        // Step 1: Navigate and wait for Cloudflare to clear
        console.log('  Loading NC SOS (waiting for Cloudflare)...');
        await page.goto('https://www.sosnc.gov/online_services/search/by_title/search_Business_Registration_changes', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Wait for Cloudflare challenge to resolve
        let formReady = false;
        for (let i = 0; i < 30; i++) {
            formReady = await page.evaluate(() => {
                const sel = document.querySelector('select');
                return sel && sel.options.length > 1;
            });
            if (formReady) break;

            // Try to click Cloudflare Turnstile checkbox if present
            if (i === 3 || i === 8 || i === 15) {
                try {
                    const frames = page.frames();
                    for (const frame of frames) {
                        const checkbox = await frame.$('input[type="checkbox"], .cf-turnstile, #challenge-stage');
                        if (checkbox) {
                            await checkbox.click();
                            console.log('    Clicked Cloudflare challenge checkbox');
                        }
                    }
                    // Also try clicking in the iframe area directly
                    const turnstileFrame = frames.find(f => f.url().includes('challenges.cloudflare.com'));
                    if (turnstileFrame) {
                        const body = await turnstileFrame.$('body');
                        if (body) await body.click();
                    }
                } catch {}
            }

            console.log(`    Waiting for Cloudflare... (${i + 1})`);
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!formReady) {
            console.log('    Cloudflare did not clear — skipping NC SOS this run.');
            console.log('    TIP: Open NC SOS manually once in Chrome to set cookies, then re-run.');
            await page.close();
            return prospects;
        }
        console.log('  Cloudflare cleared. Filling form...');

        // Step 1: Select "New Businesses" and set dates
        await page.select('select', 'NEW');
        await new Promise(r => setTimeout(r, 500));

        const fromInput = await page.$('input[name="From"], input[id="From"]');
        const toInput = await page.$('input[name="To"], input[id="To"]');
        if (fromInput) { await fromInput.click({ clickCount: 3 }); await fromInput.type(fmt(weekAgo), { delay: 30 }); }
        if (toInput) { await toInput.click({ clickCount: 3 }); await toInput.type(fmt(now), { delay: 30 }); }
        console.log(`  Date range: ${fmt(weekAgo)} — ${fmt(now)}`);

        // Click Next to go to Company Type step
        const nextBtn1 = await page.$('button:not([disabled])');
        if (nextBtn1) {
            const btnText = await page.evaluate(el => el.textContent.trim(), nextBtn1);
            if (/next/i.test(btnText)) await nextBtn1.click();
        }
        // Fallback: find button by text
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const next = btns.find(b => /next/i.test(b.textContent));
            if (next) next.click();
        });
        await new Promise(r => setTimeout(r, 4000));

        // Step 2: Company Type — leave "Search All" checked (default), click Next
        console.log('  Step 2: Company Type (Search All)...');
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button:not([disabled])'));
            const next = btns.find(b => /next/i.test(b.textContent));
            if (next) next.click();
        });
        await new Promise(r => setTimeout(r, 4000));

        // Step 3: County — uncheck "Search All", check "Mecklenburg", click Search
        console.log('  Step 3: Selecting Mecklenburg county...');
        await page.evaluate(() => {
            const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
            // Uncheck "Search All"
            const searchAll = checkboxes.find(cb => cb.value === 'ALL');
            if (searchAll && searchAll.checked) searchAll.click();
            // Check "Mecklenburg"
            const meck = checkboxes.find(cb => cb.value === 'Mecklenburg');
            if (meck && !meck.checked) meck.click();
        });
        await new Promise(r => setTimeout(r, 1000));

        // Click Search
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button:not([disabled])'));
            const search = btns.find(b => /search/i.test(b.textContent) && !/all/i.test(b.textContent));
            if (search) search.click();
        });
        console.log('  Searching...');
        await new Promise(r => setTimeout(r, 8000));

        // Step 4: Extract results
        const pageTitle = await page.title();
        console.log(`  Results page: ${pageTitle}`);

        const results = await page.evaluate(() => {
            const items = [];
            // NC SOS results show business names as headings/links with SOS IDs
            // Format: "Business Name LLC • (1234567)" with "Current - Active" below
            const allText = document.body.innerText;
            const lines = allText.split('\n').map(l => l.trim()).filter(Boolean);

            for (const line of lines) {
                // Match pattern: "Business Name • (1234567)"
                const match = line.match(/^(.+?)\s*[•·]\s*\((\d{5,})\)/);
                if (match) {
                    items.push({ name: match[1].trim(), sosId: match[2] });
                    continue;
                }
                // Fallback: lines that look like LLC/Corp names
                if (/\b(LLC|L\.L\.C|INC|CORP|PLLC|P\.L\.L\.C)\b/i.test(line) && line.length > 5 && line.length < 150) {
                    if (!/current|active|file|annual|report|search|previous|next|page|county|date/i.test(line)) {
                        const cleaned = line.replace(/\s*[•·]\s*\(\d+\)/, '').trim();
                        if (cleaned.length > 3) items.push({ name: cleaned, sosId: '' });
                    }
                }
            }

            // Deduplicate
            const seen = new Set();
            return items.filter(i => {
                const key = i.name.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        });

        console.log(`  Found ${results.length} new businesses in Mecklenburg County`);

        const signageKeywords = /plumb|hvac|heat|cool|air|electric|roof|landscap|lawn|clean|construct|paint|remodel|mov|pest|floor|fenc|tree|cater|restaurant|food|fitness|salon|auto|tow|truck|deliver|courier|repair|service|maintenance|property|real|home|build|install|mechanic|weld|concrete|pav|excavat|demolit|haul|junk|storage|pet|vet|dental|medical|chiro|massage|barber|beauty|brew|coffee|bake|car wash|detail|fleet|transport|logistic|dispatch|towing|plow|pressure wash|gutters|window|door|sign|graphic|photo|studio|design|consult|agency/i;

        for (const r of results) {
            const cleanName = cleanBusinessName(r.name);
            if (!cleanName || cleanName.length < 3) continue;

            const isRelevant = signageKeywords.test(cleanName);

            // Take all of them if we have fewer than 50, otherwise filter
            if (isRelevant || results.length <= 50) {
                prospects.push({
                    name: cleanName,
                    source: 'NC Secretary of State',
                    category: categorizeByName(cleanName, ''),
                    opportunity: 'Newly registered business in Mecklenburg County — likely needs signage and vehicle branding',
                    rawDetail: r.sosId ? `SOS ID: ${r.sosId}` : '',
                    phone: '',
                    address: '',
                    website: ''
                });
            }
        }

        console.log(`  Keeping ${prospects.length} prospects (filtered for signage relevance)`);
    } catch (err) {
        console.log(`  NC SOS error: ${err.message}`);
    }

    await page.close();
    return prospects;
}

// ==================== Yelp — Local Businesses ====================

async function scrapeYelp(browser) {
    console.log('\n--- Yelp: Local Businesses in Charlotte ---');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    const prospects = [];

    const searches = [
        { query: 'Contractors', cat: 'contractor' },
        { query: 'HVAC', cat: 'contractor' },
        { query: 'Plumbers', cat: 'contractor' },
        { query: 'Electricians', cat: 'contractor' },
        { query: 'Roofing', cat: 'contractor' },
        { query: 'Landscaping', cat: 'landscaping' },
        { query: 'Auto Repair', cat: 'auto' },
        { query: 'Food Trucks', cat: 'food' },
        { query: 'Cleaning Services', cat: 'retail' },
        { query: 'Moving Companies', cat: 'contractor' },
        { query: 'Painting Companies', cat: 'contractor' },
        { query: 'Fencing', cat: 'contractor' },
    ];

    const toSearch = shuffleArray(searches).slice(0, 3);

    for (const { query, cat } of toSearch) {
        try {
            console.log(`  Yelp search: "${query}" in Charlotte...`);
            const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(query)}&find_loc=Charlotte%2C+NC`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(r => setTimeout(r, 3000));

            const results = await page.evaluate(() => {
                const items = [];
                // Yelp search result cards
                const cards = document.querySelectorAll('[data-testid="serp-ia-card"], .container__09f24__FeTO6, h3 a, [class*="businessName"] a, .css-19v1rkv');
                cards.forEach(card => {
                    const nameEl = card.querySelector('a[href*="/biz/"]') || card.closest('a[href*="/biz/"]') || card;
                    const name = nameEl?.textContent?.trim();
                    const href = nameEl?.getAttribute('href') || '';
                    if (name && name.length > 2 && name.length < 100 && href.includes('/biz/')) {
                        items.push({
                            name,
                            href: href.startsWith('http') ? href : 'https://www.yelp.com' + href
                        });
                    }
                });

                // Fallback: find all business links
                if (items.length === 0) {
                    document.querySelectorAll('a[href*="/biz/"]').forEach(a => {
                        const name = a.textContent?.trim();
                        if (name && name.length > 3 && name.length < 80 && !/photo|review|write|map/i.test(name)) {
                            items.push({
                                name,
                                href: a.href.startsWith('http') ? a.href : 'https://www.yelp.com' + a.getAttribute('href')
                            });
                        }
                    });
                }

                // Deduplicate by name
                const seen = new Set();
                return items.filter(i => {
                    if (seen.has(i.name.toLowerCase())) return false;
                    seen.add(i.name.toLowerCase());
                    return true;
                }).slice(0, 10);
            });

            console.log(`    Found ${results.length} businesses, extracting contact info...`);

            // Click into each listing for phone
            for (const biz of results) {
                try {
                    await page.goto(biz.href, { waitUntil: 'networkidle2', timeout: 15000 });
                    await new Promise(r => setTimeout(r, 2000));

                    const details = await page.evaluate(() => {
                        const info = { phone: '', address: '', website: '' };
                        const text = document.body.textContent;

                        // Phone
                        const phoneMatch = text.match(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/);
                        if (phoneMatch) info.phone = phoneMatch[0];

                        // Address
                        const addrEls = document.querySelectorAll('address, [class*="address"], p');
                        addrEls.forEach(el => {
                            const t = el.textContent.trim();
                            if (/Charlotte.*NC|NC\s+\d{5}/i.test(t) && t.length < 150) {
                                info.address = t.replace(/\s+/g, ' ').substring(0, 100);
                            }
                        });

                        // Website link
                        document.querySelectorAll('a[href*="biz_redir"]').forEach(a => {
                            const href = a.getAttribute('href') || '';
                            const urlMatch = href.match(/url=([^&]+)/);
                            if (urlMatch) {
                                try { info.website = decodeURIComponent(urlMatch[1]); } catch {}
                            }
                        });

                        return info;
                    });

                    prospects.push({
                        name: biz.name,
                        phone: details.phone || '',
                        address: details.address || '',
                        website: details.website || '',
                        source: 'Yelp',
                        category: cat,
                        opportunity: `Found on Yelp "${query}" — check if they have vehicle branding or signage`,
                        mapsLink: biz.href
                    });

                    const contactStr = [details.phone, details.website].filter(Boolean).join(', ') || 'no contact found';
                    console.log(`      ✓ ${biz.name} — ${contactStr}`);

                    await new Promise(r => setTimeout(r, 1000));
                } catch {
                    prospects.push({
                        name: biz.name,
                        phone: '', address: '', website: '',
                        source: 'Yelp', category: cat,
                        opportunity: `Found on Yelp "${query}" — check if they have vehicle branding or signage`,
                        mapsLink: biz.href
                    });
                    console.log(`      ✗ ${biz.name} — couldn't load details`);
                }
            }

            console.log(`    Completed Yelp "${query}" — ${results.length} businesses`);
            await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
            console.log(`    Error searching Yelp "${query}": ${err.message}`);
        }
    }

    await page.close();
    return prospects;
}

// ==================== Google Maps — Businesses Without Branding ====================

async function scrapeGoogleMaps(browser) {
    console.log('\n--- Google Maps: Local Businesses (with contact info) ---');
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    const prospects = [];

    const searches = [
        'new businesses in Charlotte NC',
        'contractors Charlotte NC',
        'HVAC companies Charlotte NC',
        'plumbers Charlotte NC',
        'landscaping Charlotte NC',
        'food trucks Charlotte NC',
        'auto repair Charlotte NC',
        'cleaning service Charlotte NC',
        'electrician Charlotte NC',
        'roofing Charlotte NC',
        'painting company Charlotte NC',
        'moving company Charlotte NC',
    ];

    const toSearch = shuffleArray(searches).slice(0, 3);

    for (const query of toSearch) {
        try {
            console.log(`  Searching Google Maps: "${query}"...`);
            const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            await new Promise(r => setTimeout(r, 3000));

            // Handle consent/cookie popups
            try {
                const consentBtn = await page.$('button[aria-label="Accept all"]');
                if (consentBtn) await consentBtn.click();
                await new Promise(r => setTimeout(r, 1000));
            } catch {}

            // Scroll the results panel to load more
            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => {
                    const panel = document.querySelector('div[role="feed"]');
                    if (panel) panel.scrollBy(0, 800);
                });
                await new Promise(r => setTimeout(r, 1500));
            }

            // Get all listing links
            const listingLinks = await page.evaluate(() => {
                const items = [];
                const cards = document.querySelectorAll('div[role="feed"] > div > div > a');
                cards.forEach(card => {
                    const name = card.getAttribute('aria-label');
                    const href = card.getAttribute('href');
                    if (name && name.length > 2 && href) {
                        items.push({ name, href });
                    }
                });
                return items.slice(0, 12);
            });

            console.log(`    Found ${listingLinks.length} listings, extracting contact info...`);

            // Click into each listing to get phone, address, website
            for (const listing of listingLinks) {
                try {
                    await page.goto(listing.href, { waitUntil: 'networkidle2', timeout: 20000 });
                    await new Promise(r => setTimeout(r, 2000));

                    const details = await page.evaluate(() => {
                        const info = { phone: '', address: '', website: '' };

                        // Extract from the info panel buttons/links
                        const allButtons = document.querySelectorAll('button[data-tooltip], a[data-tooltip], button[aria-label], a[aria-label]');
                        allButtons.forEach(el => {
                            const label = (el.getAttribute('data-tooltip') || el.getAttribute('aria-label') || '').toLowerCase();
                            const text = el.textContent.trim();

                            if (/phone|call/i.test(label) || /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(text)) {
                                const phoneMatch = (label + ' ' + text).match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
                                if (phoneMatch) info.phone = phoneMatch[0];
                            }
                            if (/website/i.test(label) && el.href) {
                                info.website = el.href;
                            }
                        });

                        // Try extracting from aria-label attributes on action buttons
                        const actionBtns = document.querySelectorAll('[data-item-id]');
                        actionBtns.forEach(el => {
                            const itemId = el.getAttribute('data-item-id') || '';
                            const ariaLabel = el.getAttribute('aria-label') || '';

                            if (itemId.startsWith('phone:') || /phone/i.test(itemId)) {
                                const phoneMatch = (itemId + ' ' + ariaLabel).match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
                                if (phoneMatch) info.phone = phoneMatch[0];
                            }
                            if (itemId === 'authority' || /website/i.test(itemId)) {
                                info.website = ariaLabel || '';
                            }
                            if (itemId === 'address' || /address/i.test(itemId)) {
                                info.address = ariaLabel.replace(/^address:\s*/i, '') || '';
                            }
                        });

                        // Fallback: look for phone pattern anywhere in the info section
                        const infoSection = document.querySelector('[role="main"]');
                        if (infoSection && !info.phone) {
                            const allText = infoSection.textContent;
                            const phoneMatch = allText.match(/\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/);
                            if (phoneMatch) info.phone = phoneMatch[0];
                        }

                        // Look for address in the page text
                        if (!info.address && infoSection) {
                            const addrMatch = infoSection.textContent.match(/\d+\s+[A-Za-z][\w\s]+(?:St|Ave|Blvd|Rd|Dr|Ln|Way|Ct|Pkwy|Hwy|Circle|Place|Pl)\.?(?:[,\s]+(?:Suite|Ste|#|Apt)?\s*[\w-]+)?[,\s]+Charlotte[,\s]+NC\s+\d{5}/i);
                            if (addrMatch) info.address = addrMatch[0].trim();
                        }

                        return info;
                    });

                    prospects.push({
                        name: listing.name,
                        phone: details.phone || '',
                        address: details.address || '',
                        website: details.website || '',
                        source: 'Google Maps',
                        category: categorizeByQuery(query),
                        opportunity: `Found via "${query}" — check if they have vehicle branding or signage`,
                        mapsLink: listing.href
                    });

                    const contactStr = [details.phone, details.website].filter(Boolean).join(', ') || 'no contact found';
                    console.log(`      ✓ ${listing.name} — ${contactStr}`);

                    await new Promise(r => setTimeout(r, 1000));
                } catch (err) {
                    // If individual listing fails, still add with just the name
                    prospects.push({
                        name: listing.name,
                        phone: '',
                        address: '',
                        website: '',
                        source: 'Google Maps',
                        category: categorizeByQuery(query),
                        opportunity: `Found via "${query}" — check if they have vehicle branding or signage`,
                        mapsLink: listing.href
                    });
                    console.log(`      ✗ ${listing.name} — couldn't load details`);
                }
            }

            console.log(`    Completed "${query}" — ${listingLinks.length} businesses scraped`);
            await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
            console.log(`    Error searching "${query}": ${err.message}`);
        }
    }

    await page.close();
    return prospects;
}

// ==================== Helpers ====================

function cleanBusinessName(name) {
    return name
        .replace(/\b(LLC|INC|CORP|LTD|PLLC|LP|DBA)\b\.?/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function categorizeByName(name, searchTerm) {
    const lower = (name + ' ' + searchTerm).toLowerCase();
    if (/plumb|hvac|electric|roof|construct|remodel|paint|floor|fenc/i.test(lower)) return 'contractor';
    if (/landscap|lawn|tree|garden/i.test(lower)) return 'landscaping';
    if (/restaurant|cater|food|pizza|grill|bbq|bakery|cafe/i.test(lower)) return 'food';
    if (/auto|car|tow|truck|mechanic/i.test(lower)) return 'auto';
    if (/real estate|realty|property|homes/i.test(lower)) return 'realestate';
    if (/clean|salon|fitness|dental|medical|spa|barber/i.test(lower)) return 'retail';
    return 'contractor';
}

function categorizeByQuery(query) {
    const lower = query.toLowerCase();
    if (/contractor|hvac|plumb|electric/i.test(lower)) return 'contractor';
    if (/landscap|lawn/i.test(lower)) return 'landscaping';
    if (/food|restaurant/i.test(lower)) return 'food';
    if (/auto|repair/i.test(lower)) return 'auto';
    if (/real estate/i.test(lower)) return 'realestate';
    if (/clean/i.test(lower)) return 'retail';
    return 'contractor';
}

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ==================== Main Runner ====================

async function main() {
    console.log('===========================================');
    console.log('  Creative Studio — Lead Scraper');
    console.log(`  ${new Date().toLocaleString()}`);
    console.log('===========================================');

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Load existing prospects to avoid duplicates
    let existing = [];
    if (fs.existsSync(PROSPECTS_FILE)) {
        existing = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf-8'));
    }
    const existingNames = new Set(existing.map(p => p.name.toLowerCase().trim()));

    // Also load names already imported into the dashboard
    const knownNamesFile = path.join(DATA_DIR, 'known-names.json');
    if (fs.existsSync(knownNamesFile)) {
        const knownNames = JSON.parse(fs.readFileSync(knownNamesFile, 'utf-8'));
        knownNames.forEach(n => existingNames.add(n.toLowerCase().trim()));
        console.log(`\nKnown names from dashboard: ${knownNames.length}`);
    }

    console.log(`Existing scraped prospects: ${existing.length}`);
    console.log(`Total names to skip: ${existingNames.size}`);

    let browser;
    try {
        const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
        const userDataDir = path.join(DATA_DIR, 'chrome-profile');
        console.log(`Launching ${chromePath.includes('chrome') ? 'Chrome' : 'Edge'} (real browser + persistent profile)...`);
        browser = await puppeteer.launch({
            headless: false,
            executablePath: chromePath,
            userDataDir,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars'
            ],
            defaultViewport: { width: 1280, height: 900 },
            ignoreDefaultArgs: ['--enable-automation']
        });

        let allNew = [];

        // Run each scraper
        for (const [name, scraper] of Object.entries(SCRAPERS)) {
            try {
                const results = await scraper(browser);
                const fresh = results.filter(r => !existingNames.has(r.name.toLowerCase()));
                allNew.push(...fresh);
                fresh.forEach(r => existingNames.add(r.name.toLowerCase()));
                console.log(`\n  ${name}: ${results.length} found, ${fresh.length} new`);
            } catch (err) {
                console.log(`\n  ${name}: Error — ${err.message}`);
            }
        }

        // Add metadata to new prospects
        const now = new Date().toISOString();
        const newProspects = allNew.map(p => ({
            id: Date.now() + Math.floor(Math.random() * 10000),
            name: p.name,
            contact: '',
            phone: p.phone || '',
            email: '',
            address: p.address || '',
            website: p.website || '',
            category: p.category || 'contractor',
            status: 'not-contacted',
            opportunity: p.opportunity || '',
            notes: `[Auto-scraped ${now.split('T')[0]}] Source: ${p.source}${p.address ? '\nAddress: ' + p.address : ''}${p.website ? '\nWebsite: ' + p.website : ''}${p.mapsLink ? '\nMaps: ' + p.mapsLink : ''}${p.rawDetail ? '\nDetails: ' + p.rawDetail : ''}`,
            source: p.source,
            date: now,
            auto: true
        }));

        // Merge and save
        const allProspects = [...existing, ...newProspects];
        fs.writeFileSync(PROSPECTS_FILE, JSON.stringify(allProspects, null, 2));

        console.log('\n===========================================');
        console.log(`  NEW PROSPECTS FOUND: ${newProspects.length}`);
        console.log(`  TOTAL IN DATABASE:   ${allProspects.length}`);
        console.log(`  Saved to: ${PROSPECTS_FILE}`);
        console.log('===========================================');

        if (newProspects.length > 0) {
            console.log('\n  New prospects:');
            newProspects.forEach(p => {
                console.log(`    • ${p.name} (${p.category}) — ${p.opportunity.substring(0, 60)}...`);
            });
        }

    } catch (err) {
        console.error('Fatal error:', err.message);
    } finally {
        if (browser) await browser.close();
    }

    console.log('\nDone! Open your dashboard to see the results.');
    console.log('Run "npm run serve" to start the local server.\n');
}

main();
