import { describe, it, expect } from 'vitest';
import { exportPdf } from '../src/renderer.js';
import { existsSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('exportPdf', () => {
  const cases = [
    {
      name: 'success — generates PDF file from simple HTML',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>Test</h1>
        <script>window.__mermaidReady = true;</script></body></html>`,
      format: 'A4',
    },
    {
      name: 'success — generates PDF with Letter format',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>Letter</p>
        <script>window.__mermaidReady = true;</script></body></html>`,
      format: 'Letter',
    },
    {
      name: 'success — PDF file has non-zero size',
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
        <table><tr><th>A</th></tr><tr><td>1</td></tr></table>
        <script>window.__mermaidReady = true;</script></body></html>`,
      format: 'A4',
    },
  ];

  it.each(cases)('$name', async ({ html, format }) => {
    const output = join(tmpdir(), `docan-test-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);

    try {
      const result = await exportPdf(html, { output, format });
      expect(result).toBe(output);
      expect(existsSync(output)).toBe(true);
      expect(statSync(output).size).toBeGreaterThan(0);
    } finally {
      if (existsSync(output)) unlinkSync(output);
    }
  }, 30000);
});
