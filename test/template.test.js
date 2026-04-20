import { describe, it, expect } from 'vitest';
import { buildTemplate } from '../src/template.js';

describe('buildTemplate', () => {
  const cases = [
    {
      name: 'success — produces valid HTML document',
      body: '<p>Hello</p>',
      options: {},
      contains: ['<!DOCTYPE html>', '<html', '</html>', '<p>Hello</p>'],
    },
    {
      name: 'success — light theme applied by default',
      body: '<p>Test</p>',
      options: {},
      contains: ['--color-bg: #ffffff'],
    },
    {
      name: 'success — dark theme applied when specified',
      body: '<p>Test</p>',
      options: { theme: 'dark' },
      contains: ['--color-bg: #0d1117'],
    },
    {
      name: 'success — mermaid.js script injected',
      body: '<p>Test</p>',
      options: {},
      contains: ['mermaid.min.js', 'mermaid.initialize'],
    },
    {
      name: 'success — mermaid dark theme when dark mode',
      body: '<p>Test</p>',
      options: { theme: 'dark' },
      contains: ["theme: 'dark'"],
    },
    {
      name: 'success — mermaid default theme when light mode',
      body: '<p>Test</p>',
      options: { theme: 'light' },
      contains: ["theme: 'default'"],
    },
    {
      name: 'success — title set in head',
      body: '<p>Test</p>',
      options: { title: 'My Doc' },
      contains: ['<title>My Doc</title>'],
    },
    {
      name: 'edge — title with special characters escaped',
      body: '<p>Test</p>',
      options: { title: '<script>alert("xss")</script>' },
      notContains: ['<script>alert'],
    },
    {
      name: 'success — base CSS includes table styles',
      body: '<p>Test</p>',
      options: {},
      contains: ['border-collapse: collapse', 'table th', 'table tbody tr { background-color: transparent; }'],
      notContains: ['nth-child(2n)'],
    },
    {
      name: 'success — base CSS includes callout styles',
      body: '<p>Test</p>',
      options: {},
      contains: ['.callout-note', '.callout-warning', '.callout-title'],
    },
  ];

  it.each(cases)('$name', ({ body, options, contains, notContains }) => {
    const result = buildTemplate(body, options);

    if (contains) {
      for (const substr of contains) {
        expect(result).toContain(substr);
      }
    }
    if (notContains) {
      for (const substr of notContains) {
        expect(result).not.toContain(substr);
      }
    }
  });
});
