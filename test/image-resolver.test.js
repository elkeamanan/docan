import { describe, it, expect } from 'vitest';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveImages } from '../src/image-resolver.js';

const tmpPng = join(tmpdir(), 'docan-test-img.png');
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

describe('resolveImages', () => {
  const cases = [
    {
      name: 'success — existing image converted to base64 data URI',
      setup: () => writeFileSync(tmpPng, TINY_PNG),
      teardown: () => unlinkSync(tmpPng),
      html: `<img src="${tmpPng}" alt="test">`,
      baseDir: tmpdir(),
      expectContains: 'data:image/png;base64,',
    },
    {
      name: 'success — absolute URL left untouched',
      html: '<img src="https://example.com/img.png" alt="remote">',
      baseDir: '/home/user/docs',
      expectContains: 'https://example.com/img.png',
    },
    {
      name: 'success — data URI left untouched',
      html: '<img src="data:image/png;base64,abc123" alt="inline">',
      baseDir: '/home/user/docs',
      expectContains: 'data:image/png;base64,abc123',
    },
    {
      name: 'edge — no images in HTML',
      html: '<p>No images here</p>',
      baseDir: '/docs',
      expectExact: '<p>No images here</p>',
    },
    {
      name: 'success — missing image produces warning and stays unchanged',
      html: '<img src="nonexistent.png" alt="missing">',
      baseDir: '/tmp',
      expectWarningCount: 1,
      expectContains: 'nonexistent.png',
    },
    {
      name: 'edge — missing image does not get data URI',
      html: '<img src="nope.png" alt="nope">',
      baseDir: '/tmp',
      expectNotContains: 'data:',
    },
  ];

  it.each(cases)('$name', ({ setup, teardown, html, baseDir, expectContains, expectNotContains, expectExact, expectWarningCount }) => {
    if (setup) setup();
    try {
      const result = resolveImages(html, baseDir);

      if (expectContains) {
        expect(result.html).toContain(expectContains);
      }
      if (expectNotContains) {
        expect(result.html).not.toContain(expectNotContains);
      }
      if (expectExact !== undefined) {
        expect(result.html).toBe(expectExact);
      }
      if (expectWarningCount !== undefined) {
        expect(result.warnings).toHaveLength(expectWarningCount);
      }
    } finally {
      if (teardown) teardown();
    }
  });
});
