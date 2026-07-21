// Genera le immagini di testata (1200x630) per gli articoli che non ne hanno,
// in stile coerente col tema del sito: sfondo scuro, glifo in gradiente, kicker.
// Uso: node scripts/gen-headers.mjs  (richiede playwright-core + Chrome installato)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = new URL('../public/images/', import.meta.url).pathname;

// hue1/hue2: coppia di tinte del gradiente del glifo
const CARDS = [
  { slug: 'og-default', glyph: 'Luigi Bifulco', kicker: 'Software · Architettura · Semplicità', h1: 211, h2: 271, small: true },
  { slug: 'come-ho-resuscitato-il-mio-blog', glyph: '⟲ reborn', kicker: 'luigibifulco.it — il blog è tornato', h1: 211, h2: 271 },
  { slug: 'js-is-dead', glyph: 'JS?', kicker: 'luigibifulco.it — opinioni dal 2015', h1: 48, h2: 28 },
  { slug: 'node-js-non-e-javascript', glyph: 'node.js', kicker: 'luigibifulco.it', h1: 120, h2: 160 },
  { slug: 'gods-of-build-tools', glyph: '{ build }', kicker: 'luigibifulco.it — gods of build tools', h1: 28, h2: 48 },
  { slug: 'app-js-prototype', glyph: 'app.js', kicker: 'luigibifulco.it', h1: 199, h2: 240 },
  { slug: 'windows-10-one-get', glyph: 'OneGet ❯_', kicker: 'luigibifulco.it — package management', h1: 190, h2: 220 },
  { slug: 'large-scale-javascript-projects-1', glyph: 'scale()', kicker: 'luigibifulco.it — large scale JS', h1: 262, h2: 292 },
  { slug: 'javascript-mastering-global-scope', glyph: 'window.*', kicker: 'luigibifulco.it — global scope', h1: 340, h2: 10 },
  { slug: 'appify-page-templating', glyph: '</template>', kicker: 'luigibifulco.it — appify', h1: 168, h2: 190 },
  { slug: 'cookie-disclaimer', glyph: '🍪 consent', kicker: 'luigibifulco.it', h1: 32, h2: 16 },
  { slug: 'gwt-2-8-0-jsinterop', glyph: 'GWT ⇄ JS', kicker: 'luigibifulco.it — JsInterop', h1: 0, h2: 22 },
  { slug: 'java-9-jigsaw', glyph: 'Java 9', kicker: 'luigibifulco.it — project jigsaw', h1: 22, h2: 200 },
  { slug: 'large-scale-javsacript-project', glyph: 'modules', kicker: 'luigibifulco.it — appify project', h1: 262, h2: 211 },
  { slug: 'reactjsday-2025-pillole-1-bundler', glyph: '#1 · bundle', kicker: 'reactjsday 2025 in pillole', h1: 190, h2: 211 },
  { slug: 'reactjsday-2025-pillole-2-testing', glyph: '#2 · tests ✓', kicker: 'reactjsday 2025 in pillole', h1: 145, h2: 175 },
  { slug: 'reactjsday-2025-pillole-3-state-management', glyph: '#3 · state', kicker: 'reactjsday 2025 in pillole', h1: 211, h2: 250 },
  { slug: 'reactjsday-2025-pillole-4-modularization', glyph: '#4 · modules', kicker: 'reactjsday 2025 in pillole', h1: 262, h2: 300 },
  { slug: 'reactjsday-2025-pillole-5-react-compiler', glyph: '#5 · compiler', kicker: 'reactjsday 2025 in pillole', h1: 28, h2: 350 },
  { slug: 'tanstack-query-dictionary-combine', glyph: 'combine({…keys})', kicker: 'luigibifulco.it — tanstack query patterns', h1: 352, h2: 32, small: true },
  { slug: 'maximum-update-depth-fiber-probe', glyph: '⚠ Maximum update depth exceeded', kicker: 'luigibifulco.it — a caccia del colpevole nei fiber', h1: 0, h2: 25, small: true },
  { slug: 'reactjsday-2025-pillole-6-usetransition', glyph: '#6 · ⏳ transition', kicker: 'reactjsday 2025 in pillole', h1: 175, h2: 145 },
  { slug: 'claude-global-workspace-j-space', glyph: 'J-space', kicker: 'luigibifulco.it — interpretability research', h1: 260, h2: 200, small: true },
];

const html = ({ glyph, kicker, h1, h2, small }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    background:
      radial-gradient(900px 600px at 18% 8%, hsl(${h1} 55% 16%), transparent 65%),
      radial-gradient(900px 700px at 85% 95%, hsl(${h2} 55% 12%), transparent 60%),
      #0b0d11;
    color: #f5f5f7;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    position: relative;
  }
  .grid {
    position: absolute; inset: 0; opacity: 0.5;
    background:
      repeating-linear-gradient(0deg, transparent 0 79px, rgba(255,255,255,0.035) 79px 80px),
      repeating-linear-gradient(90deg, transparent 0 79px, rgba(255,255,255,0.035) 79px 80px);
  }
  .glyph {
    font-size: ${small ? '104px' : '150px'};
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    background: linear-gradient(92deg, hsl(${h1} 90% 62%), hsl(${h2} 85% 66%));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    padding: 0 60px 14px;
    max-width: 1150px;
    text-align: center;
    z-index: 1;
  }
  .kicker {
    margin-top: 34px;
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(245,245,247,0.55);
    z-index: 1;
  }
  .rule {
    margin-top: 26px; width: 84px; height: 5px; border-radius: 3px;
    background: linear-gradient(90deg, hsl(${h1} 90% 62%), hsl(${h2} 85% 66%));
    z-index: 1;
  }
</style></head>
<body><div class="grid"></div><div class="glyph">${glyph}</div><div class="rule"></div><div class="kicker">${kicker}</div></body></html>`;

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 } })).newPage();

for (const card of CARDS) {
  await page.setContent(html(card), { waitUntil: 'networkidle' });
  const path =
    card.slug === 'og-default'
      ? join(OUT, 'og-default.jpg')
      : (mkdirSync(join(OUT, card.slug), { recursive: true }), join(OUT, card.slug, 'header.jpg'));
  await page.screenshot({ path, type: 'jpeg', quality: 88 });
  console.log('ok', card.slug);
}
await browser.close();
