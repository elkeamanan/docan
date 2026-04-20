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
  max-width: 980px;
  margin: 0 auto;
  padding: 32px 28px;
  word-wrap: break-word;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid var(--color-border); }
h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid var(--color-border); }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }

p { margin-top: 0; margin-bottom: 16px; }

a { color: var(--color-link); text-decoration: none; }
a:hover { text-decoration: underline; }

img { max-width: 100%; height: auto; border-style: none; }

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

/* Print-specific */
@media print {
  body { max-width: none; padding: 0; }
  pre, code { white-space: pre-wrap !important; word-break: break-all; }
  .mermaid svg { max-width: 100% !important; }
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
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: '${mermaidTheme}' });
    window.__mermaidReady = false;
    mermaid.run().then(() => { window.__mermaidReady = true; }).catch(() => { window.__mermaidReady = true; });
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
