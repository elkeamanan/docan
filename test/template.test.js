import { describe, it, expect } from 'vitest';
import { buildTemplate, buildPaginatedTemplate } from '../src/template.js';

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
    {
      name: 'success — copy button uses wrapper div not pre',
      body: '<p>Test</p>',
      options: {},
      contains: ['.code-block-wrapper', 'code-block-wrapper', 'wrapper.appendChild(btn)'],
      notContains: ['pre.hljs .copy-btn', 'pre.appendChild(btn)'],
    },
    {
      name: 'success — mermaid svg constrained with max-width',
      body: '<p>Test</p>',
      options: {},
      contains: ['.mermaid svg'],
    },
    {
      name: 'success — centers No/# columns in non-paginated template',
      body: '<p>Test</p>',
      options: {},
      contains: [
        'centerNumericColumns',
        'CENTER_HEADER_PATTERNS',
        "'no'",
        "'no.'",
        "'#'",
        "textAlign = 'center'",
        'centerNumericColumns();',
      ],
    },
    {
      name: 'success — er and classDiagram get taller max-height in CSS',
      body: '<p>Test</p>',
      options: {},
      contains: [
        '.mermaid svg[aria-roledescription="er"]',
        '.mermaid svg[aria-roledescription="class"]',
        'max-height: 900px',
      ],
    },
    {
      name: 'success — MERMAID_MAX_HEIGHT map used in constrainMermaid',
      body: '<p>Test</p>',
      options: {},
      contains: ['MERMAID_MAX_HEIGHT', "aria-roledescription", "MERMAID_MAX_HEIGHT[type] || '500px'"],
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

describe('buildPaginatedTemplate', () => {
  const cases = [
    {
      name: 'success — disables pagedjs auto-start for handler registration',
      body: '<p>Test</p>',
      options: {},
      contains: ['PagedConfig', 'auto: false'],
    },
    {
      name: 'success — sizes table columns per-table before pagination',
      body: '<p>Test</p>',
      options: {},
      contains: ['sizeTableColumns', 'sizeTableColumns();', 'data-col-widths'],
      notContains: ['equalizeTableColumns', 'tableGroups'],
    },
    {
      name: 'success — centers cells in numeric columns (No, #) detected via header text',
      body: '<p>Test</p>',
      options: {},
      contains: [
        'centerNumericColumns',
        'CENTER_HEADER_PATTERNS',
        "'no'",
        "'no.'",
        "'#'",
        "textAlign = 'center'",
      ],
    },
    {
      name: 'success — reapplies column widths to paged fragments after pagedjs renders',
      body: '<p>Test</p>',
      options: {},
      contains: [
        'reapplyColWidthsToPages',
        '.pagedjs_page table[data-col-widths]',
        'p.then(reapplyColWidthsToPages)',
      ],
    },
    {
      name: 'success — mermaid svg constrained in paginated pages',
      body: '<p>Test</p>',
      options: {},
      contains: ['.pagedjs_page .mermaid svg', 'max-height: 500px'],
    },
    {
      name: 'success — er and classDiagram get taller max-height in paginated CSS',
      body: '<p>Test</p>',
      options: {},
      contains: [
        '.pagedjs_page .mermaid svg[aria-roledescription="er"]',
        '.pagedjs_page .mermaid svg[aria-roledescription="class"]',
        'max-height: 270mm',
      ],
    },
    {
      name: 'success — MERMAID_MAX_HEIGHT map used in paginated constrainMermaid',
      body: '<p>Test</p>',
      options: {},
      contains: ['MERMAID_MAX_HEIGHT', "aria-roledescription", "MERMAID_MAX_HEIGHT[type] || '500px'"],
    },
    {
      name: 'success — constrainMermaid preserves natural width, caps max dimensions',
      body: '<p>Test</p>',
      options: {},
      contains: ['constrainMermaid', "style.maxWidth = '100%'", "style.height = 'auto'", 'viewBox', "setAttribute('width', vbW)", "removeAttribute('height')"],
      notContains: ["removeAttribute('width')", "style.width = 'auto'"],
    },
    {
      name: 'success — applies colgroup widths as percent of total',
      body: '<p>Test</p>',
      options: {},
      contains: ['(w / total * 100).toFixed'],
    },
    {
      name: 'success — colgroup injected for proportional column widths',
      body: '<p>Test</p>',
      options: {},
      contains: ['createElement(\'colgroup\')', 'tableLayout = \'fixed\''],
    },
    {
      name: 'success — mermaid svg has max-height cap',
      body: '<p>Test</p>',
      options: {},
      contains: ['max-height: 500px'],
    },
    {
      name: 'success — paginated constrainMermaid preserves natural width, caps max dimensions',
      body: '<p>Test</p>',
      options: {},
      contains: ['constrainMermaid', "style.maxWidth = '100%'", "style.height = 'auto'", 'viewBox', "setAttribute('width', vbW)", "removeAttribute('height')"],
      notContains: ["removeAttribute('width')", "style.width = 'auto'"],
    },
  ];

  it.each(cases)('$name', ({ body, options, contains, notContains }) => {
    const result = buildPaginatedTemplate(body, options);

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
