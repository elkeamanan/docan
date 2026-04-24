import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser.js';

describe('parse', () => {
  const cases = [
    {
      name: 'success — basic markdown to HTML',
      input: '# Hello\n\nSome paragraph.',
      expected: { contains: ['<h1', 'Hello', '<p>Some paragraph.'] },
    },
    {
      name: 'success — GFM table',
      input: '| A | B |\n|---|---|\n| 1 | 2 |',
      expected: { contains: ['<table>', '<th>', '<td>'] },
    },
    {
      name: 'success — code block with syntax highlighting',
      input: '```go\nfunc main() {}\n```',
      expected: { contains: ['class="hljs"', '<code>'] },
    },
    {
      name: 'success — mermaid block preserved as mermaid class',
      input: '```mermaid\ngraph LR\n  A-->B\n```',
      expected: { contains: ['class="mermaid"', 'graph LR'] },
    },
    {
      name: 'success — mermaid block not wrapped in code tag',
      input: '```mermaid\ngraph LR\n  A-->B\n```',
      expected: { notContains: ['<code>'] },
    },
    {
      name: 'success — mermaid w= sets max-width style',
      input: '```mermaid w=400px\nerDiagram\n  FOO { int id }\n```',
      expected: { contains: ['class="mermaid"', 'max-width:400px'] },
    },
    {
      name: 'success — mermaid width= sets max-width style',
      input: '```mermaid width=50%\nerDiagram\n  FOO { int id }\n```',
      expected: { contains: ['class="mermaid"', 'max-width:50%'] },
    },
    {
      name: 'edge — mermaid without w= has no inline style',
      input: '```mermaid\ngraph LR\n  A-->B\n```',
      expected: { notContains: ['max-width'] },
    },
    {
      name: 'edge — mermaid w= rejects invalid unit',
      input: '```mermaid w=400abc\ngraph LR\n  A-->B\n```',
      expected: { notContains: ['max-width'] },
    },
    {
      name: 'success — NOTE callout rendered',
      input: '> [!NOTE]\n> This is a note.',
      expected: { contains: ['callout-note', 'callout-title', 'Note'] },
    },
    {
      name: 'success — IMPORTANT callout rendered',
      input: '> [!IMPORTANT]\n> Critical info.',
      expected: { contains: ['callout-important', 'Important'] },
    },
    {
      name: 'success — WARNING callout rendered',
      input: '> [!WARNING]\n> Be careful.',
      expected: { contains: ['callout-warning', 'Warning'] },
    },
    {
      name: 'success — CAUTION callout rendered',
      input: '> [!CAUTION]\n> Danger zone.',
      expected: { contains: ['callout-caution', 'Caution'] },
    },
    {
      name: 'success — TIP callout rendered',
      input: '> [!TIP]\n> Pro tip here.',
      expected: { contains: ['callout-tip', 'Tip'] },
    },
    {
      name: 'edge — regular blockquote not converted to callout',
      input: '> Just a regular quote.',
      expected: { notContains: ['callout-note', 'callout-title'] },
    },
    {
      name: 'edge — empty input',
      input: '',
      expected: { equals: '' },
    },
    {
      name: 'success — inline code preserved',
      input: 'Use `docan` command.',
      expected: { contains: ['<code>docan</code>'] },
    },
    {
      name: 'success — heading anchors',
      input: '## My Section',
      expected: { contains: ['id="my-section"'] },
    },
  ];

  it.each(cases)('$name', ({ input, expected }) => {
    const result = parse(input);

    if (expected.contains) {
      for (const substr of expected.contains) {
        expect(result).toContain(substr);
      }
    }
    if (expected.notContains) {
      for (const substr of expected.notContains) {
        expect(result).not.toContain(substr);
      }
    }
    if (expected.equals !== undefined) {
      expect(result.trim()).toBe(expected.equals);
    }
  });
});
