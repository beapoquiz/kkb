/**
 * Generates the favicon, PWA icons, apple-touch-icon and Open Graph image from the real
 * <Plutus /> component, so the icons always match the mascot in the app.
 *
 *   npm run assets
 */
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const BLUE_SOFT = '#CDE9FF';
const CREAM = '#FFF8F0';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
const { Plutus } = await vite.ssrLoadModule('/src/mascot/Plutus.tsx');
await vite.close();

/** Inner SVG content of a Plutus mood (drops the outer <svg> so it can be placed anywhere). */
function plutusInner(mood) {
  const svg = renderToStaticMarkup(
    createElement(Plutus, { mood, animated: false, decorative: true }),
  );
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

/**
 * Plutus, whole and centered, on a soft glow inside a rounded square. Maskable icons get a
 * smaller fish so he stays inside the safe zone when the launcher crops to a circle.
 */
function iconSvg({ rounded = true, scale = 2.3 } = {}) {
  const r = rounded ? 112 : 0;
  // Center of the fish in Plutus's own 200×200 viewBox (tail tip to nose, fin to belly).
  const [cx, cy] = [92, 100];
  const tx = 256 - cx * scale;
  const ty = 256 - cy * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${r}" fill="${BLUE_SOFT}"/>
  <circle cx="${tx + 104 * scale}" cy="${ty + 110 * scale}" r="${66 * scale}" fill="#FFFFFF" opacity="0.55"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">${plutusInner('happy')}</g>
</svg>`;
}

await mkdir('public', { recursive: true });
await writeFile('public/favicon.svg', iconSvg());
await writeFile('public/plutus-icon.svg', iconSvg());

const fontCss = async (pkg, weight) => {
  const dir = require.resolve(`@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff2`);
  const data = (await readFile(dir)).toString('base64');
  const family = pkg[0].toUpperCase() + pkg.slice(1);
  return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2');}`;
};
const fonts = [await fontCss('fredoka', 600), await fontCss('nunito', 700)].join('\n');

const browser = await chromium.launch();
const page = await browser.newPage();

async function rasterize(svg, size, file) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  await page.screenshot({ path: file, omitBackground: true });
}

await rasterize(iconSvg(), 192, 'public/pwa-192x192.png');
await rasterize(iconSvg(), 512, 'public/pwa-512x512.png');
await rasterize(iconSvg({ rounded: false, scale: 1.85 }), 512, 'public/maskable-512x512.png');
await rasterize(iconSvg({ rounded: false, scale: 2.1 }), 180, 'public/apple-touch-icon.png');

// Open Graph image, 1200×630.
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<style>${fonts}
  html,body{margin:0}
  .card{width:1200px;height:630px;box-sizing:border-box;display:flex;align-items:center;gap:40px;padding:0 90px;
    background:linear-gradient(135deg,${CREAM} 0%,${CREAM} 55%,${BLUE_SOFT} 100%);font-family:Nunito,sans-serif;color:#3B3350}
  .fish{width:420px;height:420px;flex:none}
  h1{font:600 150px/1 Fredoka,sans-serif;color:#2B6FA8;margin:0}
  p{margin:18px 0 0;font-size:36px;font-weight:700;white-space:nowrap}
  small{display:block;margin-top:14px;font-size:28px;color:#6B6280;font-weight:700}
</style>
<div class="card">
  <svg class="fish" viewBox="0 0 200 200">${plutusInner('celebrating')}</svg>
  <div><h1>KKB</h1><p>Kanya-Kanyang Bayad, made easy.</p>
  <small>Split bills with your barkada. Settle up in the fewest payments.</small></div>
</div>`);
await page.screenshot({ path: 'public/og-image.png' });

await browser.close();
console.log('Assets written to public/');
