import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { parse } from './parser.js';
import { resolveImages } from './image-resolver.js';
import { buildTemplate, buildPaginatedTemplate } from './template.js';
import { preview, exportPdf } from './renderer.js';

function processMarkdown(inputPath, theme, paginated = false) {
  const absPath = resolve(inputPath);
  const baseDir = dirname(absPath);
  const title = basename(absPath, extname(absPath));

  const markdown = readFileSync(absPath, 'utf-8');
  const bodyHtml = parse(markdown);
  const { html: resolvedHtml, warnings } = resolveImages(bodyHtml, baseDir);

  for (const w of warnings) {
    console.warn(`[warn] ${w}`);
  }

  const builder = paginated ? buildPaginatedTemplate : buildTemplate;
  return builder(resolvedHtml, { theme, title });
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
    .option('--paginated', 'Paginated preview — exact PDF layout with page breaks')
    .action(async (input, opts) => {
      try {
        const absPath = resolve(input);
        const html = processMarkdown(input, opts.theme, opts.paginated);
        await preview(html, {
          watchPath: absPath,
          rebuild: () => processMarkdown(input, opts.theme, opts.paginated),
        });
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
        await exportPdf(html, { output, format: opts.format });
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.parse(argv);
}
