const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(express.json());

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.use(express.static(__dirname));

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// API: Get auto-scraped prospects
app.get('/api/prospects', (req, res) => {
    const file = path.join(DATA_DIR, 'auto-prospects.json');
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        res.json(data);
    } else {
        res.json([]);
    }
});

// API: Mark a prospect as imported (so it doesn't show as "new" again)
app.post('/api/prospects/mark-imported', (req, res) => {
    const { ids } = req.body;
    const file = path.join(DATA_DIR, 'auto-prospects.json');
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        data.forEach(p => {
            if (ids.includes(p.id)) p.imported = true;
        });
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
    res.json({ ok: true });
});

// API: Receive known names from dashboard so scraper can skip them
app.post('/api/prospects/known-names', (req, res) => {
    const { names } = req.body;
    const file = path.join(DATA_DIR, 'known-names.json');
    fs.writeFileSync(file, JSON.stringify(names || []));
    res.json({ ok: true, count: (names || []).length });
});

// API: Get scraper status
app.get('/api/scraper/status', (req, res) => {
    const file = path.join(DATA_DIR, 'auto-prospects.json');
    let lastRun = null;
    let totalProspects = 0;
    let newCount = 0;

    if (fs.existsSync(file)) {
        const stat = fs.statSync(file);
        lastRun = stat.mtime.toISOString();
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        totalProspects = data.length;
        newCount = data.filter(p => !p.imported).length;
    }

    res.json({ lastRun, totalProspects, newCount });
});

// API: Run the scraper now
app.post('/api/scraper/run', (req, res) => {
    const { execFile } = require('child_process');
    res.json({ status: 'started', message: 'Scraper is running in the background...' });

    execFile('node', ['scraper.js'], { cwd: __dirname }, (err, stdout, stderr) => {
        if (err) console.error('Scraper error:', err.message);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
    });
});

const server = app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║      Creative Studio - Local Server      ║');
    console.log('  ╠══════════════════════════════════════════╣');
    console.log(`  ║  Website:    http://localhost:${PORT}          ║`);
    console.log(`  ║  Dashboard:  http://localhost:${PORT}/dashboard ║`);
    console.log('  ║                                          ║');
    console.log('  ║  Scraper API ready                       ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
setInterval(() => {}, 30000);
