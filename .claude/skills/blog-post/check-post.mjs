#!/usr/bin/env node
// Verifica meccanica degli invarianti di un articolo del blog.
// Uso: node .claude/skills/blog-post/check-post.mjs <slug> [--built]
//   --built: verifica anche l'output in dist/ (richiede un `npm run build` appena fatto)
// Exit code 0 = nessun errore (i warning non fanno fallire).
import { readFileSync, existsSync, readdirSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../../', import.meta.url).pathname;
const [, , slug, ...flags] = process.argv;
const CHECK_BUILT = flags.includes('--built');

if (!slug) {
  console.error('uso: node .claude/skills/blog-post/check-post.mjs <slug|--all> [--built]');
  process.exit(2);
}

// --all: passa in rassegna ogni articolo italiano (uno per slug, in sottoprocesso)
if (slug === '--all') {
  const { spawnSync } = await import('node:child_process');
  const all = readdirSync(join(ROOT, 'src/content/blog/it'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3))
    .sort();
  let failed = 0;
  for (const s of all) {
    const r = spawnSync(process.execPath, [process.argv[1], s, ...flags], { encoding: 'utf8' });
    const interesting = r.stdout.split('\n').filter((l) => /^[✗!]/.test(l));
    if (interesting.length) {
      console.log(`\n${s}`);
      for (const l of interesting) console.log(`  ${l}`);
    }
    if (r.status !== 0) failed++;
  }
  console.log(`\n${all.length} articoli controllati, ${failed} con errori\n`);
  process.exit(failed ? 1 : 0);
}

const errors = [];
const warns = [];
const notes = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);
const note = (m) => notes.push(m);

// ——— parser frontmatter minimale (copre le forme usate nel blog) ———
function parseFrontmatter(raw, file) {
  if (!raw.startsWith('---\n')) {
    err(`${file}: manca il frontmatter (il file deve iniziare con "---")`);
    return { data: null, body: raw };
  }
  const end = raw.indexOf('\n---', 4);
  if (end === -1) {
    err(`${file}: frontmatter non chiuso`);
    return { data: null, body: raw };
  }
  const block = raw.slice(4, end);
  const body = raw.slice(raw.indexOf('\n', end + 1) + 1);
  const data = {};
  for (const line of block.split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) {
      err(`${file}: riga di frontmatter non interpretabile: ${JSON.stringify(line)}`);
      continue;
    }
    const [, key, rawVal] = m;
    const v = rawVal.trim();
    if (v.startsWith('[')) {
      try {
        data[key] = JSON.parse(v.replace(/'/g, '"'));
      } catch {
        err(`${file}: campo "${key}" non è un array JSON valido: ${v}`);
      }
    } else if (/^".*"$/.test(v) || /^'.*'$/.test(v)) {
      data[key] = v.slice(1, -1);
    } else if (v === 'true' || v === 'false') {
      data[key] = v === 'true';
    } else {
      data[key] = v;
    }
  }
  return { data, body };
}

// ——— dimensioni JPEG leggendo i marker SOFn ———
function jpegSize(path) {
  const fd = openSync(path, 'r');
  try {
    const buf = Buffer.alloc(65536);
    const len = readSync(fd, buf, 0, buf.length, 0);
    if (buf.readUInt16BE(0) !== 0xffd8) return null; // non è un JPEG
    let off = 2;
    while (off + 9 < len) {
      if (buf[off] !== 0xff) {
        off++;
        continue;
      }
      const marker = buf[off + 1];
      const size = buf.readUInt16BE(off + 2);
      // SOF0..SOF15 escluse DHT(c4) DAC(cc) RSTn
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
      }
      off += 2 + size;
    }
    return null;
  } finally {
    closeSync(fd);
  }
}

const itDir = join(ROOT, 'src/content/blog/it');
const enDir = join(ROOT, 'src/content/blog/en');
const slugsIn = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];
const IT_SLUGS = new Set(slugsIn(itDir));
const EN_SLUGS = new Set(slugsIn(enDir));

// ——— 1. slug ———
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  err(`slug "${slug}": deve essere kebab-case minuscolo (lettere, cifre, trattini)`);
}

// ——— 2. i file ———
const files = [];
for (const [lang, dir] of [['it', itDir], ['en', enDir]]) {
  const path = join(dir, `${slug}.md`);
  if (existsSync(path)) files.push({ lang, path, rel: `src/content/blog/${lang}/${slug}.md` });
}
if (!files.some((f) => f.lang === 'it')) {
  err(`manca src/content/blog/it/${slug}.md — la versione italiana è obbligatoria`);
}
if (files.length === 0) {
  console.error(`\n✗ nessun file trovato per lo slug "${slug}"\n`);
  process.exit(1);
}
if (!files.some((f) => f.lang === 'en')) {
  note(`nessuna versione inglese (src/content/blog/en/${slug}.md) — opzionale, ma senza di essa non compare lo switch lingua`);
}

const parsed = [];
for (const f of files) {
  const raw = readFileSync(f.path, 'utf8');
  const { data, body } = parseFrontmatter(raw, f.rel);
  if (data) parsed.push({ ...f, data, body });
}

// ——— 3. frontmatter: campi richiesti dallo schema + regole di casa ———
// Senza questi la build fallisce sullo schema Zod.
const SCHEMA_REQUIRED = ['title', 'date', 'lang', 'translationKey'];
// Questi hanno un default nello schema: non rompono la build, ma un articolo
// pubblicato senza description/tags/immagine è monco per SEO e social.
const HOUSE_REQUIRED = ['description', 'tags', 'headerImage'];

for (const p of parsed) {
  for (const k of SCHEMA_REQUIRED) {
    if (p.data[k] === undefined) err(`${p.rel}: manca il campo "${k}" — la build fallirà sullo schema`);
  }
  for (const k of HOUSE_REQUIRED) {
    if (p.data[k] !== undefined) continue;
    const what = `${p.rel}: manca il campo "${k}" (default nello schema, ma obbligatorio per le regole del blog)`;
    // Se l'articolo è hidden non è online: è debito da saldare prima di abilitarlo, non un guasto.
    p.data.hidden === true ? warn(`${what} — da sistemare prima di togliere hidden`) : err(what);
  }

  if (p.data.lang !== p.lang) {
    err(`${p.rel}: lang è "${p.data.lang}" ma il file sta nella cartella ${p.lang}/ — devono coincidere`);
  }
  if (p.data.translationKey !== slug) {
    err(`${p.rel}: translationKey è "${p.data.translationKey}" ma deve essere "${slug}" (l'URL si costruisce da lì)`);
  }

  const desc = p.data.description ?? '';
  if (desc.length < 120 || desc.length > 160) {
    warn(`${p.rel}: description di ${desc.length} caratteri — la finestra utile è 120-160 (meta description + sottotitolo)`);
  }
  const title = p.data.title ?? '';
  if (title.length > 65) {
    warn(`${p.rel}: title di ${title.length} caratteri — oltre ~65 viene troncato nelle SERP`);
  }

  const date = String(p.data.date ?? '');
  if (Number.isNaN(new Date(date).valueOf())) {
    err(`${p.rel}: date "${date}" non è una data valida — la build fallirà sullo schema`);
  } else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/.test(date)) {
    warn(`${p.rel}: date "${date}" senza orario — i nuovi articoli usano l'ISO completa (es. 2026-09-12T10:00:00+02:00): l'orario ordina quelli pubblicati lo stesso giorno`);
  } else if (new Date(date) > new Date()) {
    warn(`${p.rel}: date è nel futuro (${date}) — l'articolo verrà comunque generato, Astro non fa embargo sulle date`);
  }

  const tags = p.data.tags ?? [];
  if (Array.isArray(tags)) {
    if (tags.length < 3 || tags.length > 6) {
      warn(`${p.rel}: ${tags.length} tag — la convenzione è 3-6`);
    }
    const bad = tags.filter((t) => t !== t.toLowerCase());
    if (bad.length) err(`${p.rel}: tag non minuscoli: ${bad.join(', ')}`);
  }

  if (p.data.headerImage !== undefined && p.data.headerImage !== `/images/${slug}/header.jpg`) {
    err(`${p.rel}: headerImage è "${p.data.headerImage}" ma la convenzione è "/images/${slug}/header.jpg"`);
  }

  if (p.data.hidden === true) {
    note(`${p.rel}: hidden: true — in dev è visibile col badge "nascosto", in produzione non viene generata nessuna pagina`);
  }
  if (p.data.draft === true) {
    note(`${p.rel}: draft: true — pagina raggiungibile ma esclusa da home e RSS (per l'embargo si usa hidden)`);
  }
}

// ——— 4. coerenza della coppia IT/EN ———
const it = parsed.find((p) => p.lang === 'it');
const en = parsed.find((p) => p.lang === 'en');
if (it && en) {
  if (String(it.data.date) !== String(en.data.date)) {
    warn(`date diverse tra IT (${it.data.date}) e EN (${en.data.date}) — le traduzioni di solito condividono la data`);
  }
  if (!!it.data.hidden !== !!en.data.hidden) {
    // Stato legittimo (una lingua pubblicata, l'altra ancora da tradurre o da
    // rivedere): non si rompe niente, sparisce solo lo switch lingua. Va però
    // notato, perché se l'intenzione era pubblicare entrambe è una svista.
    warn(`hidden disallineato: IT=${!!it.data.hidden}, EN=${!!en.data.hidden} — solo una versione andrà online e lo switch lingua non comparirà; voluto?`);
  }
  if (it.data.headerImage !== en.data.headerImage) {
    warn(`headerImage diverso tra IT e EN — di norma le due versioni condividono la stessa immagine`);
  }
}

// ——— 5. immagine di testata ———
// Le card generate da gen-headers.mjs devono essere esattamente 1200x630; per le foto
// ereditate dalla migrazione Kirby la misura sbagliata è un difetto noto, non un blocco.
const genHeaders = readFileSync(join(ROOT, 'scripts/gen-headers.mjs'), 'utf8');
const hasCard = new RegExp(`slug:\\s*'${slug}'`).test(genHeaders);

const imgRel = `public/images/${slug}/header.jpg`;
const imgPath = join(ROOT, imgRel);
if (!existsSync(imgPath)) {
  err(`manca ${imgRel} — generala aggiungendo una card in scripts/gen-headers.mjs ed eseguendo lo script`);
} else {
  const size = jpegSize(imgPath);
  if (!size) err(`${imgRel}: non sembra un JPEG valido`);
  else if (size.width !== 1200 || size.height !== 630) {
    const m = `${imgRel}: ${size.width}x${size.height} invece di 1200x630 — le card social verranno ritagliate male`;
    hasCard ? err(`${m} (è una card generata: rigenerala)`) : warn(`${m} (foto non generata)`);
  }
}
if (!hasCard) {
  warn(`scripts/gen-headers.mjs non contiene una card per "${slug}" — l'immagine non è rigenerabile se va persa`);
}

// ——— 6. link interni: prefisso lingua giusto, slug esistente, trailing slash ———
// I blocchi di codice vanno esclusi: un "# commento" shell non è un h1, e un URL
// dentro un esempio non è un link da risolvere.
const stripFences = (body) => body.replace(/^```[\s\S]*?^```/gm, '');

for (const p of parsed) {
  const prose = stripFences(p.body);
  const links = [...prose.matchAll(/\]\((\/(?:en\/)?blog\/[a-z0-9-]+\/?)\)/g)].map((m) => m[1]);
  for (const href of links) {
    const targetLang = href.startsWith('/en/blog/') ? 'en' : 'it';
    const target = href.replace(/^\/(en\/)?blog\//, '').replace(/\/$/, '');
    const good = p.lang === 'it' ? `/blog/${target}/` : `/en/blog/${target}/`;
    // il link deve esistere nella lingua verso cui punta, altrimenti è un 404
    if (!(targetLang === 'it' ? IT_SLUGS : EN_SLUGS).has(target)) {
      err(`${p.rel}: link "${href}" → nessun articolo "${target}" in ${targetLang}/, è un 404`);
    } else if (targetLang !== p.lang) {
      // Esiste, ma porta il lettore nell'altra lingua. È un errore solo se la
      // versione nella sua lingua c'era e non è stata usata; se manca, il rimando
      // all'altra lingua può essere una scelta dell'autore (di solito dichiarata
      // nel testo, es. "(in Italian)") — lì basta segnalarlo.
      if ((p.lang === 'it' ? IT_SLUGS : EN_SLUGS).has(target)) {
        err(`${p.rel}: link "${href}" manda un lettore ${p.lang} sulla versione ${targetLang} — usa "${good}"`);
      } else {
        warn(`${p.rel}: link "${href}" manda un lettore ${p.lang} sulla versione ${targetLang}, "${target}" non esiste in ${p.lang}/ — ok se il testo lo dichiara, altrimenti traducilo o togli il link`);
      }
    } else if (!href.endsWith('/')) {
      warn(`${p.rel}: link "${href}" senza slash finale — usa "${good}"`);
    }
  }
  if (!/^#### /m.test(prose)) {
    warn(`${p.rel}: nessun titoletto "#### " — la convenzione del blog usa h4 per le sezioni`);
  }
  if (/^# /m.test(prose)) {
    err(`${p.rel}: contiene un "# " di primo livello — l'h1 lo mette già il layout dal title`);
  }
}

// ——— 7. output di build (opzionale) ———
if (CHECK_BUILT) {
  const dist = join(ROOT, 'dist');
  if (!existsSync(dist)) {
    err('dist/ non esiste — esegui `npm run build` prima di usare --built');
  } else {
    for (const p of parsed) {
      const pageRel = p.lang === 'it' ? `dist/blog/${slug}/index.html` : `dist/en/blog/${slug}/index.html`;
      const built = existsSync(join(ROOT, pageRel));
      if (p.data.hidden === true && built) {
        err(`${pageRel} è stato generato ma l'articolo è hidden — la build non ha rispettato il flag`);
      }
      if (p.data.hidden !== true && !built) {
        err(`${pageRel} non è stato generato — l'articolo non esiste sul sito`);
      }
    }
    const rssPath = join(dist, 'rss.xml');
    if (existsSync(rssPath) && it) {
      const inRss = readFileSync(rssPath, 'utf8').includes(`/blog/${slug}/`);
      const shouldBeInRss = !it.data.hidden && !it.data.draft;
      if (shouldBeInRss && !inRss) err(`l'articolo non compare in dist/rss.xml`);
      if (!shouldBeInRss && inRss) err(`l'articolo compare in dist/rss.xml ma è hidden/draft`);
    }
    const smPath = join(dist, 'sitemap-0.xml');
    if (existsSync(smPath) && it && !it.data.hidden) {
      if (!readFileSync(smPath, 'utf8').includes(`/blog/${slug}/`)) {
        warn(`l'articolo non compare in dist/sitemap-0.xml`);
      }
    }
  }
}

// ——— report ———
const line = (icon, m) => console.log(`${icon} ${m}`);
console.log(`\nInvarianti articolo "${slug}" — ${parsed.map((p) => p.lang).join(' + ') || 'nessuna lingua'}\n`);
for (const m of errors) line('✗', m);
for (const m of warns) line('!', m);
for (const m of notes) line('·', m);
if (!errors.length && !warns.length) line('✓', 'tutti gli invarianti rispettati');
console.log(
  `\n${errors.length} error${errors.length === 1 ? '' : 's'}, ${warns.length} warning${warns.length === 1 ? '' : 's'}${CHECK_BUILT ? '' : '  (build non verificata: aggiungi --built dopo npm run build)'}\n`
);
process.exit(errors.length ? 1 : 0);
