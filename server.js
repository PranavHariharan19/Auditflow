import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/extract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    // Add simple json helper to res for serverless handler compatibility
    res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
    };
    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
    };

    if (req.method === 'POST' && req.url === '/api/extract') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                req.body = JSON.parse(body || '{}');
                await handler(req, res);
            } catch (err) {
                res.status(400).json({ error: 'Invalid JSON request body' || err.message });
            }
        });
        return;
    }

    // Serve static files (index.html, etc.)
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) {
        res.status(404).end('Not Found');
        return;
    }

    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
    };

    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
    console.log(`🚀 Auditflow local server running at http://localhost:${PORT}`);
    console.log(`✦ Using API proxy with .env.local configuration`);
});
