import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parse } from '../src/parser.js';
import { resolveImages } from '../src/image-resolver.js';
import { buildTemplate } from '../src/template.js';
import { exportPdf } from '../src/renderer.js';

const FIXTURES = join(import.meta.dirname, 'fixtures');

function pipeline(fixtureName, theme = 'light') {
  const inputPath = join(FIXTURES, fixtureName);
  const markdown = readFileSync(inputPath, 'utf-8');
  const bodyHtml = parse(markdown);
  const { html } = resolveImages(bodyHtml, FIXTURES);
  return buildTemplate(html, { theme, title: fixtureName });
}

describe('integration — full pipeline', () => {
  const cases = [
    {
      name: 'success — simple markdown produces valid PDF',
      fixture: 'simple.md',
    },
    {
      name: 'success — mermaid fixture produces PDF',
      fixture: 'with-mermaid.md',
    },
    {
      name: 'success — tables fixture produces PDF',
      fixture: 'with-tables.md',
    },
    {
      name: 'success — callouts fixture produces PDF',
      fixture: 'with-callouts.md',
    },
  ];

  it.each(cases)('$name', async ({ fixture }) => {
    const html = pipeline(fixture);
    const output = join(tmpdir(), `docan-int-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);

    try {
      await exportPdf(html, { output, format: 'A4' });
      expect(existsSync(output)).toBe(true);
      expect(statSync(output).size).toBeGreaterThan(100);
    } finally {
      if (existsSync(output)) unlinkSync(output);
    }
  }, 30000);
});

describe('integration — HTML content verification', () => {
  const cases = [
    {
      name: 'success — mermaid block in HTML has mermaid class',
      fixture: 'with-mermaid.md',
      contains: ['class="mermaid"', 'mermaid.initialize'],
    },
    {
      name: 'success — callouts have proper CSS classes',
      fixture: 'with-callouts.md',
      contains: ['callout-note', 'callout-warning', 'callout-important', 'callout-tip', 'callout-caution'],
    },
    {
      name: 'success — tables have table elements',
      fixture: 'with-tables.md',
      contains: ['<table>', '<th>', 'Alice', 'Engineer'],
    },
    {
      name: 'success — dark theme produces dark CSS vars',
      fixture: 'simple.md',
      theme: 'dark',
      contains: ['--color-bg: #0d1117'],
    },
    {
      name: 'success — light theme produces light CSS vars',
      fixture: 'simple.md',
      theme: 'light',
      contains: ['--color-bg: #ffffff'],
    },
  ];

  it.each(cases)('$name', ({ fixture, theme, contains }) => {
    const html = pipeline(fixture, theme);
    for (const substr of contains) {
      expect(html).toContain(substr);
    }
  });
});
