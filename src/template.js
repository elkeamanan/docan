import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_CSS = `
* { box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-fg);
  background-color: var(--color-bg);
  word-wrap: break-word;
}

@media screen {
  html {
    background: #404040;
    padding: 24px 0;
    min-height: 100vh;
  }
  body {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm 15mm;
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6);
  }
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
h1 { font-size: 2em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }

p { margin-top: 0; margin-bottom: 16px; }

a { color: var(--color-link); text-decoration: none; }
a:hover { text-decoration: underline; }

img { max-width: 100%; height: auto; border-style: none; }
table td img { height: 20px; width: auto; max-width: none; }

hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: var(--color-hr);
  border: 0;
}

blockquote {
  margin: 0 0 16px 0;
  padding: 0 1em;
  color: var(--color-blockquote-fg);
  border-left: 0.25em solid var(--color-blockquote-border);
}

ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
li + li { margin-top: 0.25em; }

/* Tables */
table {
  border-spacing: 0;
  border-collapse: collapse;
  margin-top: 0;
  margin-bottom: 16px;
  width: auto;
  overflow: auto;
  display: table;
}
table th, table td {
  padding: 6px 13px;
  border: 1px solid var(--color-table-border);
}
table th {
  font-weight: 600;
  background-color: var(--color-code-bg);
}
table tbody tr { background-color: transparent; }
table:has(thead th:first-child:empty):has(thead th:last-child:empty) thead { display: none; }

/* Code */
code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  background-color: var(--color-code-bg);
  border-radius: 6px;
  color: var(--color-code-fg);
}

pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--color-code-bg);
  border-radius: 6px;
  margin-top: 0;
  margin-bottom: 16px;
}
pre code {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  font-size: 100%;
}

/* Callouts */
.callout {
  padding: 8px 16px;
  margin-bottom: 16px;
  border-left-width: 4px;
  border-left-style: solid;
  border-radius: 6px;
}
.callout p { margin-bottom: 8px; }
.callout p:last-child { margin-bottom: 0; }
.callout-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 4px !important;
}
.callout-icon { font-size: 1em; }

.callout-note { background-color: var(--callout-note-bg); border-left-color: var(--callout-note-border); }
.callout-note .callout-title { color: var(--callout-note-fg); }
.callout-tip { background-color: var(--callout-tip-bg); border-left-color: var(--callout-tip-border); }
.callout-tip .callout-title { color: var(--callout-tip-fg); }
.callout-important { background-color: var(--callout-important-bg); border-left-color: var(--callout-important-border); }
.callout-important .callout-title { color: var(--callout-important-fg); }
.callout-warning { background-color: var(--callout-warning-bg); border-left-color: var(--callout-warning-border); }
.callout-warning .callout-title { color: var(--callout-warning-fg); }
.callout-caution { background-color: var(--callout-caution-bg); border-left-color: var(--callout-caution-border); }
.callout-caution .callout-title { color: var(--callout-caution-fg); }

/* Mermaid */
.mermaid {
  background: transparent !important;
  text-align: center;
  padding: 16px 0;
  overflow: auto;
}

/* Strong / Bold */
strong { font-weight: 600; }

/* Code block copy button */
.code-block-wrapper {
  position: relative;
}
.code-block-wrapper .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1;
  color: var(--color-fg);
  background-color: var(--color-code-bg);
  border: 1px solid var(--color-table-border);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}
.code-block-wrapper:hover .copy-btn { opacity: 1; }
.code-block-wrapper .copy-btn:hover { background-color: var(--color-hr); }

@media print {
  body { padding: 0; }
  pre, code { white-space: pre-wrap !important; word-break: break-all; }
  .mermaid svg { max-width: 100% !important; }
  .copy-btn { display: none !important; }
}
`;

function loadThemeVars(theme) {
  const file = join(__dirname, 'themes', `${theme}.css`);
  return readFileSync(file, 'utf-8');
}

export function buildTemplate(bodyHtml, options = {}) {
  const { theme = 'light', title = 'Document' } = options;
  const themeVars = loadThemeVars(theme);
  const mermaidTheme = theme === 'dark' ? 'dark' : 'default';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${themeVars}\n${BASE_CSS}</style>
</head>
<body>
  <article class="markdown-body">
    ${bodyHtml}
  </article>
  <script>
    document.querySelectorAll('pre.hljs').forEach(function(pre) {
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function() {
        var code = pre.querySelector('code');
        navigator.clipboard.writeText(code.textContent).then(function() {
          btn.textContent = 'Copied!';
          setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
        });
      });
      wrapper.appendChild(btn);
    });
  </script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: '${mermaidTheme}' });
    window.__mermaidReady = false;
    mermaid.run().then(() => { window.__mermaidReady = true; }).catch(() => { window.__mermaidReady = true; });
  </script>
</body>
</html>`;
}

export function buildPaginatedTemplate(bodyHtml, options = {}) {
  const { theme = 'light', title = 'Document' } = options;
  const themeVars = loadThemeVars(theme);
  const mermaidTheme = theme === 'dark' ? 'dark' : 'default';

  const PAGINATED_CSS = `
@page { size: A4; margin: 20mm 15mm; }
.pagedjs_pages {
  background: #404040;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  min-height: 100vh;
}
.pagedjs_page {
  background: white;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6);
  margin-bottom: 24px !important;
}
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${themeVars}\n${BASE_CSS}\n${PAGINATED_CSS}</style>
</head>
<body>
  <article class="markdown-body">
    ${bodyHtml}
  </article>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: '${mermaidTheme}' });
    window.__mermaidReady = false;
    var done = function() {
      window.__mermaidReady = true;
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/pagedjs/dist/paged.polyfill.js';
      document.head.appendChild(s);
    };
    mermaid.run().then(done).catch(done);
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
