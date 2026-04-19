import puppeteer from 'puppeteer';
import { createServer } from 'node:http';

const MERMAID_TIMEOUT = 30000;

async function waitForMermaid(page) {
  await page.waitForFunction('window.__mermaidReady === true', { timeout: MERMAID_TIMEOUT });
}

export async function preview(html, options = {}) {
  const { port = 3000 } = options;

  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Preview server running at http://localhost:${port}`);
      console.log(`Open in VS Code: Ctrl+Shift+P → "Simple Browser: Show" → http://localhost:${port}`);
      console.log(`Press Ctrl+C to stop.`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} already in use. Try --port <number>`);
      }
      reject(err);
    });
  });
}

export async function exportPdf(html, options = {}) {
  const { output = 'output.pdf', format = 'A4' } = options;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await waitForMermaid(page);

    await page.pdf({
      path: output,
      format,
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });

    return output;
  } finally {
    await browser.close();
  }
}
