import { resolve, isAbsolute, extname } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const IMG_SRC_REGEX = /(<img\s[^>]*?src=["'])([^"']+)(["'][^>]*?>)/gi;

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
};

function toDataUri(absPath) {
  const ext = extname(absPath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  const data = readFileSync(absPath).toString('base64');
  return `data:${mime};base64,${data}`;
}

export function resolveImages(html, baseDir) {
  const warnings = [];

  const resolved = html.replace(IMG_SRC_REGEX, (match, prefix, src, suffix) => {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return match;
    }

    const absPath = isAbsolute(src) ? src : resolve(baseDir, src);

    if (!existsSync(absPath)) {
      warnings.push(`Image not found: ${src} (resolved to ${absPath})`);
      return match;
    }

    const dataUri = toDataUri(absPath);
    return `${prefix}${dataUri}${suffix}`;
  });

  return { html: resolved, warnings };
}
