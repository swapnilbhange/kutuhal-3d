// render.mjs — deterministic frame renderer (headless Chrome -> ffmpeg), parallel workers.
//   node render.mjs --project projects/my-short                      full video  -> build/video_silent.mp4
//   node render.mjs --project P --from 0 --to 10 --scale 0.5         preview range -> build/preview.mp4
//   node render.mjs --project P --sheet                              one still per shot -> build/sheets/sheet_XX.png
//   node render.mjs --project P --stills 3.5,12,20                   stills at times  -> build/stills/
//   node render.mjs --project P --styles midnight,ember,arctic,neon,pastel --at 3.5,12,20   style grid -> build/styles/style_grid.png
// Options: --workers N  --scale K  --style ID  --format jpeg|png  --crf N  --resume  --out FILE
import http from 'node:http'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); args[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; } }
if (!args.project) { console.error('usage: node render.mjs --project projects/<name> [options]'); process.exit(1); }
const PROJECT = path.resolve(args.project), BUILD = path.join(PROJECT, 'build'); fs.mkdirSync(BUILD, { recursive: true });
const CFG = JSON.parse(fs.readFileSync(path.join(PROJECT, 'config.json'), 'utf8')); const FPS = CFG.fps || 30;
const RES = { '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160 }[CFG.resolution || '1080p'] || 1080;
const SCALE = (RES / 1080) * (+args.scale || 1);

function chromePath() {
  const home = os.homedir(), c = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'];
  for (const base of [path.join(home, '.cache/ms-playwright'), path.join(home, 'Library/Caches/ms-playwright'), path.join(home, 'AppData/Local/ms-playwright')]) {
    if (fs.existsSync(base)) for (const d of fs.readdirSync(base).filter(x => x.startsWith('chromium')).sort().reverse()) for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe']) c.push(path.join(base, d, rel));
  }
  const p = c.find(x => x && fs.existsSync(x)); if (!p) throw new Error('Chrome/Chromium not found. Install Chrome, run `npx playwright install chromium`, or set CHROME_PATH.'); return p;
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
function listScenes(dir, base) { let out = []; if (!fs.existsSync(dir)) return out; for (const f of fs.readdirSync(dir).sort()) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) out = out.concat(listScenes(p, `${base}/${f}`)); else if (f.endsWith('.js') && !f.startsWith('_')) out.push(`${base}/${f}`); } return out; }
function serve() { return new Promise(res => { const s = http.createServer((req, rsp) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/__manifest') { rsp.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return rsp.end(JSON.stringify(listScenes(path.join(PROJECT, 'scenes'), '/project/scenes').sort((a, b) => (a.includes('cast') ? 0 : a.includes('/sets/') ? 1 : 2) - (b.includes('cast') ? 0 : b.includes('/sets/') ? 1 : 2) || a.localeCompare(b)))); }
  const p = url === '/' ? path.join(ROOT, 'player.html') : url.startsWith('/project/') ? path.join(PROJECT, url.slice(9)) : path.join(ROOT, url);
  if (!(p.startsWith(ROOT) || p.startsWith(PROJECT)) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
  rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(p).pipe(rsp); }).listen(0, '127.0.0.1', () => res(s)); }); }

const LAUNCH = () => ({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-color-profile=srgb'] });
async function open(srv, style) {
  const b = await puppeteer.launch(LAUNCH()); const page = await b.newPage(); await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: SCALE });
  page.on('pageerror', e => console.log('[pageerror]', e.message)); page.on('console', m => { const t = m.text(); if (/ERROR|rror:/.test(t) && !/GPU stall|GL Driver/.test(t)) console.log('[page]', t); });
  await page.goto(`http://127.0.0.1:${srv.address().port}/player.html?${style ? 'style=' + style : args.style ? 'style=' + args.style : ''}`);
  await page.waitForFunction('window.READY===true||!!window.BOOT_ERROR', { timeout: 180000 });
  const be = await page.evaluate('window.BOOT_ERROR'); if (be) throw new Error('Player failed to boot: ' + be);
  const [w, h] = await page.evaluate('window.OUT'); await page.setViewport({ width: w, height: h, deviceScaleFactor: SCALE }); await page.evaluate('document.fonts.ready');
  return { b, page };
}
const FMT = args.format === 'png' ? 'png' : 'jpeg';
const shot = async (page, f, file) => { await page.evaluate(i => window.renderFrame(i), f); const err = await page.evaluate('window.LAST_ERROR'); await page.screenshot({ path: file, type: FMT, ...(FMT === 'jpeg' ? { quality: 94 } : {}) }); return err; };
const py = () => (spawnSync('python3', ['--version']).status === 0 ? 'python3' : 'python');
const sheetPy = (out, cols, files) => spawnSync(py(), [path.join(ROOT, 'tools/sheet.py'), out, String(cols), ...files], { stdio: 'inherit' });
const ext = FMT === 'png' ? 'png' : 'jpg';

// ---------- internal worker: render a frame range into a directory ----------
async function worker() {
  const [a, b] = args.worker.split(',').map(Number), dir = args.frames; const srv = await serve(); const { b: br, page } = await open(srv);
  const errs = new Set(); let n = 0; const t0 = Date.now();
  for (let f = a; f < b; f++) { const file = path.join(dir, `f${String(f).padStart(5, '0')}.${ext}`); if (args.resume && fs.existsSync(file)) continue;
    const e = await shot(page, f, file); if (e) errs.add(e); n++; if (n % 25 === 0) console.log(`FRAMES ${f + 1 - a}/${b - a} ${((Date.now() - t0) / n).toFixed(0)}ms/frame`); }
  if (errs.size) console.log('SHOT ERRORS: ' + [...errs].join(' | ')); await br.close(); srv.close();
}
// ---------- stills / sheet / style grid ----------
async function stills(times, dir, name = i => `t${i}`, style) {
  fs.mkdirSync(dir, { recursive: true }); const srv = await serve(); const { b, page } = await open(srv, style); const out = []; const errs = new Set();
  for (const [i, t] of times.entries()) { const f = Math.round(t * FPS), file = path.join(dir, `${name(i, t)}.${ext}`); const e = await shot(page, f, file); if (e) errs.add(e); out.push(file); }
  const miss = (await page.evaluate('window.SHOT_LIST')).filter(s => !s.ok).map(s => s.id); if (miss.length) console.log(`MISSING SHOTS (${miss.length}): ${miss.join(', ')}`);
  if (errs.size) console.log('SHOT ERRORS: ' + [...errs].join(' | ')); const ie = await page.evaluate('window.IMPORT_ERRORS||[]'); if (ie.length) console.log('IMPORT ERRORS: ' + ie.join(' | '));
  await b.close(); srv.close(); return out;
}
async function main() {
  if (args.worker) return worker();
  const story = JSON.parse(fs.readFileSync(path.join(PROJECT, 'story/shots.json'), 'utf8'));
  if (args.sheet) { const times = story.shots.map(s => s.start + (s.end - s.start) * 0.45); const dir = path.join(BUILD, 'sheet_stills'); fs.rmSync(dir, { recursive: true, force: true });
    const files = await stills(times, dir, (i) => `${String(i + 1).padStart(3, '0')}_${story.shots[i].id}`); fs.mkdirSync(path.join(BUILD, 'sheets'), { recursive: true });
    for (let i = 0, n = 1; i < files.length; i += 24, n++) sheetPy(path.join(BUILD, 'sheets', `sheet_${String(n).padStart(2, '0')}.png`), 6, files.slice(i, i + 24)); return console.log('sheets -> build/sheets/'); }
  if (args.stills) { const times = String(args.stills).split(',').map(Number); const f = await stills(times, path.join(BUILD, 'stills'), (i, t) => `t${t}`); return console.log(f.join('\n')); }
  if (args.styles) { const times = String(args.at || '2,8,14').split(',').map(Number), ids = String(args.styles).split(','), dir = path.join(BUILD, 'styles'); fs.rmSync(dir, { recursive: true, force: true }); let all = [];
    for (const id of ids) all = all.concat(await stills(times, dir, (i) => `${id}_${i + 1}`, id)); sheetPy(path.join(dir, 'style_grid.png'), times.length, all); return console.log('grid -> build/styles/style_grid.png'); }
  // video
  const total = Math.ceil(story.duration * FPS), f0 = Math.max(0, Math.round((+args.from || 0) * FPS)), f1 = Math.min(total, args.to ? Math.round(+args.to * FPS) : total);
  const isPrev = args.from || args.to || args.scale; const dir = path.join(BUILD, isPrev ? 'preview_frames' : 'frames'); if (!args.resume) fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const W = Math.max(1, Math.min(+(args.workers || Math.max(1, Math.floor(os.cpus().length / 2))), Math.ceil((f1 - f0) / 24))), chunk = Math.ceil((f1 - f0) / W), t0 = Date.now();
  console.log(`Rendering frames ${f0}-${f1} (${((f1 - f0) / FPS).toFixed(1)} s) at scale ${SCALE.toFixed(3)} with ${W} worker(s)…`);
  await Promise.all(Array.from({ length: W }, (_, j) => new Promise((res, rej) => { const a = f0 + j * chunk, b = Math.min(f1, a + chunk); if (a >= b) return res();
    const ch = spawn(process.execPath, [fileURLToPath(import.meta.url), '--project', args.project, '--worker', `${a},${b}`, '--frames', dir, ...(args.scale ? ['--scale', args.scale] : []), ...(args.style ? ['--style', args.style] : []), ...(args.format ? ['--format', args.format] : []), ...(args.resume ? ['--resume'] : [])]);
    ch.stdout.on('data', d => process.stdout.write(`[w${j}] ${d}`)); ch.stderr.on('data', d => process.stderr.write(d)); ch.on('exit', c => c ? rej(new Error('worker ' + j + ' failed')) : res()); })));
  const out = args.out ? path.resolve(args.out) : path.join(BUILD, isPrev ? 'preview.mp4' : 'video_silent.mp4');
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(f0), '-i', path.join(dir, `f%05d.${ext}`), '-frames:v', String(f1 - f0), '-c:v', 'libx264', '-preset', 'medium', '-crf', String(args.crf || CFG.crf || 20), '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', out], { stdio: 'inherit' });
  console.log(r.status === 0 ? `DONE ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${out}` : 'ffmpeg failed');
}
main().catch(e => { console.error(e.message); process.exit(1); });
