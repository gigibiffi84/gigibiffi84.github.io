import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const SRC = '/private/tmp/claude-502/-Users-luigib-claude-projects-blog/d1ebd7cf-d80c-4409-afb8-e80d52cd15aa/scratchpad/luigibifulco.it/www.luigibifulco.it/blog/content/blog';
const DEST = '/Users/luigib/claude-projects/blog';
const CONTENT = join(DEST, 'src/content/blog');
const IMAGES = join(DEST, 'public/images');

const SKIP = new Set(['feed', 'a-sample-link-post', 'a-sample-text-post', 'a-sample-video-post', 'another-sample-text-post']);

function parseKirby(raw) {
  // Kirby fields are separated by lines of "----"
  const fields = {};
  for (const chunk of raw.replace(/^﻿/, '').split(/\n-{4,}\s*\n/)) {
    const m = chunk.match(/^\s*([A-Za-z]+):\s*([\s\S]*)$/);
    if (m) fields[m[1].toLowerCase()] = m[2].trim();
  }
  return fields;
}

function convertBody(text, slug) {
  let out = text;
  // (link: URL text: LABEL) -> [LABEL](URL)
  out = out.replace(/\(link:\s*(\S+)\s+text:\s*([^)]+?)\s*\)/g, (_, url, label) => `[${label}](${url})`);
  // (image: FILE caption: CAP) / (image: FILE) -> markdown image
  out = out.replace(/\(image:\s*(\S+?)(?:\s+caption:\s*([^)]+?))?\s*\)/g, (_, file, cap) => `![${cap || ''}](/images/${slug}/${file})`);
  // old internal blog links -> new routes
  out = out.replace(/https?:\/\/www\.luigibifulco\.it\/blog\/blog\//g, '/blog/');
  // "####Title" without space is not a heading in CommonMark
  out = out.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
  // deep-indented list items would render as code blocks
  out = out.replace(/^[ \t]{2,}\*[ \t]+/gm, '- ');
  return out.trim() + '\n';
}

function frontmatter(fields, lang, slug, draft, headerImage) {
  const tags = (fields.tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  const lines = ['---'];
  lines.push(`title: ${JSON.stringify(fields.title || slug)}`);
  if (fields.description) lines.push(`description: ${JSON.stringify(fields.description)}`);
  lines.push(`date: ${fields.date || '2016-01-01'}`);
  if (tags.length) lines.push(`tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}]`);
  lines.push(`lang: ${lang}`);
  lines.push(`translationKey: ${JSON.stringify(slug)}`);
  if (headerImage) lines.push(`headerImage: ${JSON.stringify(headerImage)}`);
  if (draft) lines.push('draft: true');
  lines.push('---', '');
  return lines.join('\n');
}

mkdirSync(join(CONTENT, 'it'), { recursive: true });
mkdirSync(join(CONTENT, 'en'), { recursive: true });

let count = 0;
for (const dir of readdirSync(SRC)) {
  const full = join(SRC, dir);
  if (!statSync(full).isDirectory() || SKIP.has(dir)) continue;
  const slug = dir.replace(/^\d+-/, '');
  const draft = !/^\d+-/.test(dir);
  const files = readdirSync(full);

  // copy non-article assets (images, code samples) to public/images/<slug>/
  const assets = files.filter((f) => !f.endsWith('.txt'));
  if (assets.length) mkdirSync(join(IMAGES, slug), { recursive: true });
  for (const a of assets) copyFileSync(join(full, a), join(IMAGES, slug, a));
  const headerImage = files.includes('header.jpg') ? `/images/${slug}/header.jpg` : undefined;

  for (const lang of ['it', 'en']) {
    const name = files.find((f) => f === `article.text.${lang}.txt`);
    if (!name) continue;
    const fields = parseKirby(readFileSync(join(full, name), 'utf8'));
    if (!fields.text) { console.warn(`SKIP ${dir}/${name}: no Text field`); continue; }
    if (!fields.date) console.warn(`WARN ${dir}/${name}: no Date, using fallback 2016-01-01`);
    const md = frontmatter(fields, lang, slug, draft, headerImage) + '\n' + convertBody(fields.text, slug);
    writeFileSync(join(CONTENT, lang, `${slug}.md`), md);
    console.log(`OK  ${lang}  ${slug}${draft ? '  (draft)' : ''}`);
    count++;
  }
}
console.log(`\n${count} file markdown generati.`);
