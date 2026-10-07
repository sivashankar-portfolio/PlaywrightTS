import { test, expect } from '@playwright/test';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { AddressInfo } from 'net';

// Serves tests/ssl-practice.html over HTTPS using a self-signed certificate
let server: https.Server;
let url: string;

test.beforeAll(async () => {
    const html = fs.readFileSync(path.join(process.cwd(), 'tests', 'ssl-practice.html'));
    server = https.createServer(
        {
            key: fs.readFileSync(path.join(process.cwd(), 'tests', 'certs', 'key.pem')),
            cert: fs.readFileSync(path.join(process.cwd(), 'tests', 'certs', 'cert.pem')),
        },
        (req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        }
    );
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    url = `https://localhost:${(server.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
});

test.describe('ignoreHTTPSErrors:true', () => {
    test.use({ ignoreHTTPSErrors: true });

    test('SSL handling - page loads with self-signed cert', async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('#title')).toHaveText('Secure Page Loaded');
        await expect(page.locator('#protocol')).toHaveText('Protocol: https:');
    });
});

test.describe('ignoreHTTPSErrors:false', () => {
    test.use({ ignoreHTTPSErrors: false });

    test('SSL handling - navigation fails with self-signed cert', async ({ page }) => {
        await expect(page.goto(url)).rejects.toThrow(/ERR_CERT/);
    });
});
