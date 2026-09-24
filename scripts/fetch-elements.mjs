#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imageDirectory = resolve(root, 'client/public/images/elements');
const dataFile = resolve(root, 'client/src/data/elements.json');
const delayMs = Number(process.env.ELEMENT_FETCH_DELAY_MS || 250);
const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));
let lastRequestAt = 0;

const elements = [
  { id: 'anemo', name: 'Anemo', asset: 'Wind' },
  { id: 'cryo', name: 'Cryo', asset: 'Ice' },
  { id: 'dendro', name: 'Dendro', asset: 'Grass' },
  { id: 'electro', name: 'Electro', asset: 'Electric' },
  { id: 'geo', name: 'Geo', asset: 'Rock' },
  { id: 'hydro', name: 'Hydro', asset: 'Water' },
  { id: 'pyro', name: 'Pyro', asset: 'Fire' },
];

async function request(url) {
  const remaining = delayMs - (Date.now() - lastRequestAt);
  if (remaining > 0) await wait(remaining);
  lastRequestAt = Date.now();
  const response = await fetch(url, { headers: { 'User-Agent': 'FlinsTierList/1.0 (element icon downloader)' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function exists(file) {
  try { return (await stat(file)).size > 0; } catch { return false; }
}

async function main() {
  await mkdir(imageDirectory, { recursive: true });
  let previous = [];
  try { previous = JSON.parse(await readFile(dataFile, 'utf8')); } catch { /* first run */ }
  const oldById = new Map(previous.map((item) => [item.id, item]));
  let downloaded = 0;
  let skipped = 0;
  let fallbackCount = 0;

  for (const element of elements) {
    const output = resolve(imageDirectory, `${element.id}.webp`);
    if (await exists(output)) {
      skipped += 1;
      continue;
    }

    const filename = `UI_Buff_Element_${element.asset}`;
    const sources = [
      `https://gi.yatta.moe/assets/UI/${filename}.png`,
      `https://enka.network/ui/${filename}.png`,
    ];
    let lastError;
    let saved = false;
    for (let index = 0; index < sources.length; index += 1) {
      try {
        const image = await request(sources[index]);
        await sharp(image)
          .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 90 })
          .toFile(output);
        downloaded += 1;
        if (index > 0) fallbackCount += 1;
        saved = true;
        console.log(`Downloaded ${element.name} icon`);
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!saved) console.warn(`No icon for ${element.name}${lastError ? `: ${lastError.message}` : ''}`);
  }

  const records = elements.map((element) => ({
    ...oldById.get(element.id),
    id: element.id,
    name: element.name,
    icon: `/images/elements/${element.id}.webp`,
  }));
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Saved element metadata to ${dataFile}`);
  console.log(`Icons: ${downloaded} downloaded, ${skipped} already present, ${fallbackCount} from Enka fallback`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
