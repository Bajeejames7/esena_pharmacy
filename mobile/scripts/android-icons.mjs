import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

/**
 * Android launcher icons and splash screens for one app, from the Esena logo.
 *
 *   node scripts/android-icons.mjs client
 *   node scripts/android-icons.mjs admin
 *
 * Renders with a Chromium-family browser (Edge on Windows by default, or
 * CHROMIUM=/path/to/chrome). The logo is a square PNG on navy, so the legacy and
 * round icons are the logo itself; the adaptive icon uses the logo inset into
 * the 66dp safe zone on a navy background, and the admin app gets a small
 * "ADMIN" band so the two are told apart on a home screen.
 */

const app = process.argv[2];
if (!['client', 'admin'].includes(app)) throw new Error('usage: android-icons.mjs client|admin');

const NAVY = '#283a92';
const RES = `${app}/android/app/src/main/res`;
const logo = `data:image/png;base64,${readFileSync('../frontend/logo/android-chrome-512x512.png').toString('base64')}`;
const band = app === 'admin'
  ? `<div style="position:absolute;left:0;right:0;bottom:0;height:22%;background:#5ab748;color:#fff;font:700 VAR_FONTpx system-ui,sans-serif;display:flex;align-items:center;justify-content:center;letter-spacing:.08em">ADMIN</div>`
  : '';

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
});

async function render(width, height, body, file, transparent = false) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:${transparent ? 'transparent' : NAVY}}</style>${body}`);
  writeFileSync(file, await page.screenshot({ omitBackground: transparent }));
  await page.close();
}

const square = (size, radius = 0) =>
  `<div style="position:relative;width:${size}px;height:${size}px;border-radius:${radius};overflow:hidden">
     <img src="${logo}" style="width:100%;height:100%;display:block">${band.replace('VAR_FONT', String(Math.round(size * 0.13)))}</div>`;

for (const [density, scale] of Object.entries({ mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 })) {
  const legacy = Math.round(48 * scale);
  const adaptive = Math.round(108 * scale);
  const inner = Math.round(adaptive * (66 / 108));
  const off = Math.round((adaptive - inner) / 2);
  await render(legacy, legacy, square(legacy), `${RES}/mipmap-${density}/ic_launcher.png`);
  await render(legacy, legacy, square(legacy, '50%'), `${RES}/mipmap-${density}/ic_launcher_round.png`, true);
  await render(adaptive, adaptive, `<div style="position:absolute;left:${off}px;top:${off}px">${square(inner)}</div>`, `${RES}/mipmap-${density}/ic_launcher_foreground.png`, true);
}

const splashes = {
  drawable: [480, 320], 'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280], 'drawable-port-mdpi': [320, 480],
  'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280], 'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920],
};
for (const [dir, [w, h]] of Object.entries(splashes)) {
  const size = Math.round(Math.min(w, h) / 3);
  await render(w, h, `<div style="position:absolute;left:${Math.round((w - size) / 2)}px;top:${Math.round((h - size) / 2)}px">${square(size, '18%')}</div>`, `${RES}/${dir}/splash.png`);
}

await browser.close();
writeFileSync(`${RES}/values/ic_launcher_background.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${NAVY.toUpperCase()}</color>\n</resources>\n`);
console.log(`icons and splash written for ${app}`);
