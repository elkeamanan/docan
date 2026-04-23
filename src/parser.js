import markdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import hljs from 'highlight.js';

const CALLOUT_TYPES = {
  NOTE: { icon: 'ℹ️', label: 'Note', cssClass: 'callout-note' },
  TIP: { icon: '💡', label: 'Tip', cssClass: 'callout-tip' },
  IMPORTANT: { icon: '📌', label: 'Important', cssClass: 'callout-important' },
  WARNING: { icon: '⚠️', label: 'Warning', cssClass: 'callout-warning' },
  CAUTION: { icon: '🚨', label: 'Caution', cssClass: 'callout-caution' },
  HIGHLIGHT: { icon: '', label: '', cssClass: 'callout-highlight', noTitle: true },
};

const CALLOUT_REGEX = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|HIGHLIGHT)\]\s*\n?/;

function calloutPlugin(md) {
  const defaultRender = md.renderer.rules.blockquote_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.core.ruler.after('block', 'callout', (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'blockquote_open') continue;

      const contentIdx = findInlineContent(tokens, i);
      if (contentIdx === -1) continue;

      const inlineToken = tokens[contentIdx];
      const match = inlineToken.content.match(CALLOUT_REGEX);
      if (!match) continue;

      const type = match[1];
      const callout = CALLOUT_TYPES[type];

      tokens[i].attrSet('class', `callout ${callout.cssClass}`);
      tokens[i].meta = { calloutType: type };

      inlineToken.content = inlineToken.content.replace(CALLOUT_REGEX, '');
      if (inlineToken.children) {
        stripCalloutPrefix(inlineToken.children, match[0]);
      }

      if (!callout.noTitle) {
        const iconToken = new state.Token('html_inline', '', 0);
        iconToken.content = `<p class="callout-title"><span class="callout-icon">${callout.icon}</span> ${callout.label}</p>`;
        tokens.splice(contentIdx, 0, iconToken);
        i++;
      }
    }
  });
}

function findInlineContent(tokens, startIdx) {
  for (let j = startIdx + 1; j < tokens.length; j++) {
    if (tokens[j].type === 'blockquote_close') return -1;
    if (tokens[j].type === 'inline') return j;
  }
  return -1;
}

function stripCalloutPrefix(children, prefix) {
  let remaining = prefix;
  for (let i = 0; i < children.length && remaining.length > 0; i++) {
    const child = children[i];
    if (child.type !== 'text') continue;
    if (child.content.length <= remaining.length) {
      remaining = remaining.slice(child.content.length);
      child.content = '';
    } else {
      child.content = child.content.slice(remaining.length);
      remaining = '';
    }
  }
}

function createParser() {
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str, lang) {
      if (lang === 'mermaid') {
        return `<pre class="mermaid">${md.utils.escapeHtml(str)}</pre>`;
      }
      if (lang && hljs.getLanguage(lang)) {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  });

  md.use(anchor, { permalink: false });
  md.use(calloutPlugin);

  return md;
}

export function parse(markdown) {
  const md = createParser();
  const html = md.render(markdown);
  return html.replace(/<!--\s*pagebreak\s*-->/gi, '<div class="page-break"></div>');
}
