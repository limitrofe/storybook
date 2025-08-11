#!/usr/bin/env node
// scripts/extract-frames-stable.js
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outBase = path.join(root, 'static', 'img', 'frames');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => (err += d.toString()));
    p.on('close', code => (code === 0 ? resolve() : reject(new Error(err || `ffmpeg exit ${code}`))));
  });
}

async function extract(video, outDir, { fps, scale, ext, isWebP, quality }) {
  await fs.mkdir(outDir, { recursive: true });
  const pattern = path.join(outDir, `frame_%04d.${ext}`);

  const vf = [`fps=${fps}`, `scale=${scale}:flags=fast_bilinear`, 'format=yuv420p'].join(',');

  const args = ['-hwaccel','auto','-i', video, '-vf', vf, '-threads','0', '-vsync','0'];
  if (isWebP) {
    args.push('-c:v','libwebp','-lossless','0','-quality', String(quality), '-compression_level','4','-preset','picture');
  } else {
    // jpg ~ 85–90% → q:v 2
    args.push('-q:v','2');
  }
  args.push(pattern);
  await run('ffmpeg', args);

  const files = (await fs.readdir(outDir)).filter(f => f.endsWith(`.${ext}`)).sort();
  return files.length;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log(`Uso: node scripts/extract-frames-stable.js <desktop.mp4> <mobile.mp4> <nome> [--fps 15] [--q 85] [--dw 1920] [--mw 768]`);
    process.exit(1);
  }
  const [desktop, mobile, name] = args;
  const fps = Math.max(1, parseInt(args[args.indexOf('--fps')+1] || '15', 10));
  const q   = Math.min(100, Math.max(0, parseInt(args[args.indexOf('--q')+1] || '85', 10)));
  const dw  = parseInt(args[args.indexOf('--dw')+1] || '1920', 10);
  const mw  = parseInt(args[args.indexOf('--mw')+1] || '768', 10);

  const clean = name.replace(/[^a-z0-9]/gi,'_').toLowerCase();

  console.log(`\n🎬 ${clean} | ${fps} fps, q=${q}, desktop ${dw}px, mobile ${mw}px`);
  const dDir = path.join(outBase, 'desktop', clean);
  const mDir = path.join(outBase, 'mobile', clean);

  const dCount = await extract(desktop, dDir, { fps, scale: `${dw}:-2`, ext: 'jpg', isWebP: false, quality: q });
  const mCount = await extract(mobile, mDir, { fps, scale: `${mw}:-2`, ext: 'webp', isWebP: true, quality: q });

  const total = Math.min(dCount, mCount);
  const config = {
    name: clean,
    desktop: { path: `/img/frames/desktop/${clean}/`, frameCount: dCount, format: 'jpg', pattern: 'frame_%04d.jpg' },
    mobile:  { path: `/img/frames/mobile/${clean}/`,  frameCount: mCount, format: 'webp', pattern: 'frame_%04d.webp' },
    settings: { fps, quality: q },
    processedAt: new Date().toISOString()
  };
  await fs.writeFile(path.join(outBase, `${clean}_config.json`), JSON.stringify(config, null, 2));

  console.log('\n💾 Use no componente:');
  console.log(`framePrefix="/img/frames/desktop/${clean}/frame_"`);
  console.log(`framePrefixMobile="/img/frames/mobile/${clean}/frame_"`);
  console.log(`startFrame=1 endFrame=${total} framePadding=4`);
  console.log(`frameExtension=".jpg" frameExtensionMobile=".webp" height="400vh"\n`);
}
main().catch(e => { console.error(e.message || e); process.exit(1); });
