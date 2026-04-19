import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { parse } from './parser.js';
import { resolveImages } from './image-resolver.js';
import { buildTemplate } from './template.js';
import { preview, exportPdf } from './renderer.js';

function processMarkdown(inputPath, theme) {
  const absPath = resolve(inputPath);
  const baseDir = dirname(absPath);
  const title = basename(absPath, extname(absPath));

  const markdown = readFileSync(absPath, 'utf-8');
  const bodyHtml = parse(markdown);
  const { html: resolvedHtml, warnings } = resolveImages(bodyHtml, baseDir);

  for (const w of warnings) {
    console.warn(`[warn] ${w}`);
  }

  return buildTemplate(resolvedHtml, { theme, title });
}

export function run(argv) {
  const program = new Command();

  program
    .name('docan')
    .description('Markdown to PDF converter with preview')
    .version('1.0.0');

  program
    .command('preview')
    .description('Preview markdown in browser')
    .argument('<input>', 'Input markdown file')
    .option('--theme <name>', 'Theme: light or dark', 'light')
    .action(async (input, opts) => {
      try {
        const html = processMarkdown(input, opts.theme);
        await preview(html);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  program
    .command('export')
    .description('Export markdown to PDF')
    .argument('<input>', 'Input markdown file')
    .option('-o, --output <path>', 'Output PDF path')
    .option('--theme <name>', 'Theme: light or dark', 'light')
    .option('--format <size>', 'Page size: A4 or Letter', 'A4')
    .action(async (input, opts) => {
      try {
        const output = opts.output || basename(input, extname(input)) + '.pdf';
        const html = processMarkdown(input, opts.theme);
        const result = await exportPdf(html, { output, format: opts.format });
        console.log(`PDF exported: ${result}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.parse(argv);
}
