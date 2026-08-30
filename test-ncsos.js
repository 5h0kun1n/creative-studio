const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const userDataDir = path.join(DATA_DIR, 'chrome-profile');

(async () => {
    const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

    console.log(`Using: ${chromePath}`);

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: chromePath,
        userDataDir,
        args: [
            '--no-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1280,900'
        ],
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // Go to homepage first
    console.log('1. Homepage...');
    await page.goto('https://www.sosnc.gov/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
    console.log(`   "${await page.title()}"`);

    // Click Online Services
    console.log('2. Clicking Online Services...');
    await page.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => /online.service/i.test(a.textContent));
        if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    console.log(`   "${await page.title()}" — ${page.url()}`);

    // Click "Businesses Search New" (the changes/new filings search)
    console.log('3. Clicking Businesses Search New...');
    await page.evaluate(() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            return href.includes('search_business_registration_changes');
        });
        if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    console.log(`   "${await page.title()}" — ${page.url()}`);

    // Now we're likely on Cloudflare. Try to click the Turnstile checkbox.
    console.log('\n4. Looking for Cloudflare Turnstile checkbox...');
    
    for (let attempt = 0; attempt < 30; attempt++) {
        // Check if form loaded (meaning Cloudflare passed)
        const hasForm = await page.evaluate(() => {
            const sel = document.querySelector('select');
            return sel && sel.options.length > 1;
        });
        if (hasForm) {
            console.log('\n*** SUCCESS — form loaded! ***\n');
            await browser.close();
            return;
        }

        const title = await page.title();
        
        // Find all iframes on the page
        const iframeInfo = await page.evaluate(() => {
            const iframes = Array.from(document.querySelectorAll('iframe'));
            return iframes.map(f => ({
                src: f.src || f.getAttribute('src') || '',
                width: f.offsetWidth,
                height: f.offsetHeight,
                id: f.id,
                title: f.title
            }));
        });

        if (attempt % 5 === 0) {
            console.log(`   [${attempt}] title="${title}" iframes=${iframeInfo.length}`);
            iframeInfo.forEach(f => console.log(`      iframe: ${f.src.substring(0, 80)} (${f.width}x${f.height}) title="${f.title}"`));
        }

        // Try clicking the Turnstile iframe checkbox
        if (iframeInfo.length > 0) {
            try {
                const iframes = await page.$$('iframe');
                for (const iframe of iframes) {
                    const box = await iframe.boundingBox();
                    if (box && box.width > 20 && box.height > 20) {
                        // Click the center-left area of the iframe (where the checkbox is)
                        const clickX = box.x + 30;
                        const clickY = box.y + box.height / 2;
                        if (attempt % 3 === 0) {
                            console.log(`   Clicking Turnstile at (${Math.round(clickX)}, ${Math.round(clickY)})...`);
                            await page.mouse.click(clickX, clickY);
                            await new Promise(r => setTimeout(r, 3000));
                        }
                    }
                }
            } catch (e) {
                console.log(`   Click error: ${e.message}`);
            }
        }

        await new Promise(r => setTimeout(r, 2000));
    }

    // Final check
    const hasForm = await page.evaluate(() => {
        const sel = document.querySelector('select');
        return sel && sel.options.length > 1;
    });

    if (hasForm) {
        console.log('\n*** SUCCESS ***\n');
    } else {
        console.log(`\n*** FAILED — "${await page.title()}" ***`);
        const text = await page.evaluate(() => document.body.innerText.substring(0, 300));
        console.log(`Page: ${text}\n`);
    }

    await browser.close();
})();
