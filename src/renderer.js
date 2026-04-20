import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { watch } from 'node:fs';

const MERMAID_TIMEOUT = 30000;

const RELOAD_SCRIPT = `<script>
  (function() {
    var es = new EventSource('/__reload');
    es.onmessage = function() { location.reload(); };
  })();
</script>`;

async function waitForMermaid(page) {
  await page.waitForFunction('window.__mermaidReady === true', { timeout: MERMAID_TIMEOUT });
}

export async function preview(initialHtml, options = {}) {
  const { port = 3000, watchPath, rebuild } = options;
  let html = initialHtml;
  const sseClients = [];

  const server = createServer((req, res) => {
    if (req.url === '/__reload') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      sseClients.push(res);
      req.on('close', () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
      });
      return;
    }
    const body = html.replace('</body>', RELOAD_SCRIPT + '</body>');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(body);
  });

  if (watchPath && rebuild) {
    let debounce = null;
    watch(watchPath, () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        try {
          html = rebuild();
          console.log(`[docan] Changes detected, reloading... (${new Date().toLocaleTimeString()})`);
          for (const client of sseClients) {
            client.write('data: reload\n\n');
          }
        } catch (err) {
          console.error(`[reload error] ${err.message}`);
        }
      }, 200);
    });
  }

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Preview server running at http://localhost:${port}`);
      console.log(`Open in VS Code: Ctrl+Shift+P → "Simple Browser: Show" → http://localhost:${port}`);
      if (watchPath) console.log(`Watching ${watchPath} for changes...`);
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
