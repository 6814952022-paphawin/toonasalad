#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imageDirectory = resolve(root, 'client/public/images/characters');
const dataFile = resolve(root, 'client/src/data/characters.json');
const yattaApi = 'https://gi.yatta.moe/api/v2';
const yattaAssets = 'https://gi.yatta.moe/assets/UI';
const enkaCharactersUrl = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json';
const delayMs = Number(process.env.CHARACTER_FETCH_DELAY_MS || 250);
const wait = (ms) => new Promise((resolveWait) => setTimeout(resolveWait, ms));
let lastRequestAt = 0;

async function request(url, attempts = 4) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const remaining = delayMs - (Date.now() - lastRequestAt);
    if (remaining > 0) await wait(remaining);
    lastRequestAt = Date.now();
    const response = await fetch(url, { headers: { 'User-Agent': 'FlinsTierList/1.0 (character asset downloader)' } });
    if (response.ok) return response;
    if (attempt < attempts - 1 && (response.status === 429 || response.status >= 500)) {
      await wait(Math.max(delayMs, 1000 * (attempt + 1)));
      continue;
    }
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  throw new Error(`Request failed after retries: ${url}`);
}

async function fetchJson(url) {
  return (await request(url)).json();
}

async function imageExists(file) {
  try { return (await stat(file)).size > 0; } catch { return false; }
}

const weaponNames = {
  WEAPON_SWORD_ONE_HAND: 'Sword',
  WEAPON_CLAYMORE: 'Claymore',
  WEAPON_POLE: 'Polearm',
  WEAPON_BOW: 'Bow',
  WEAPON_CATALYST: 'Catalyst',
};
const elementNames = {
  Wind: 'Anemo', Ice: 'Cryo', Grass: 'Dendro', Electric: 'Electro', Rock: 'Geo', Water: 'Hydro', Fire: 'Pyro',
  Anemo: 'Anemo', Cryo: 'Cryo', Dendro: 'Dendro', Electro: 'Electro', Geo: 'Geo', Hydro: 'Hydro', Pyro: 'Pyro',
};

async function main() {
  await mkdir(imageDirectory, { recursive: true });
  await mkdir(dirname(dataFile), { recursive: true });

  const versionResponse = await fetchJson(`${yattaApi}/static/version`);
  const versionHash = versionResponse?.data?.vh;
  if (!versionHash) throw new Error('Yatta version response did not include data.vh');

  // Project Amber's maintained API wrapper documents /{language}/avatar?vh={versionHash}.
  const avatarResponse = await fetchJson(`${yattaApi}/en/avatar?vh=${encodeURIComponent(versionHash)}`);
  const items = avatarResponse?.data?.items;
  if (!items || typeof items !== 'object') throw new Error('Yatta avatar response did not include data.items');

  let enkaItems = {};
  try {
    enkaItems = await fetchJson(enkaCharactersUrl);
  } catch (error) {
    console.warn(`Enka fallback metadata unavailable: ${error.message}`);
  }

  let oldRecords = [];
  if (existsSync(dataFile)) {
    try { oldRecords = JSON.parse(await readFile(dataFile, 'utf8')); } catch { oldRecords = []; }
  }
  const records = new Map(oldRecords.filter((item) => item?.id).map((item) => [String(item.id), item]));
  const characters = Object.entries(items)
    .filter(([id, item]) => /^\d+$/.test(String(item?.id ?? id)) && item?.name)
    .sort(([, left], [, right]) => String(left.name).localeCompare(String(right.name), 'en'));

  let downloaded = 0;
  let skipped = 0;
  let fallbackCount = 0;

  for (const [rawId, item] of characters) {
    const id = String(item.id ?? rawId);
    const imageFile = resolve(imageDirectory, `${id}.webp`);
    let iconName = item.icon;
    let imageReady = await imageExists(imageFile);

    if (imageReady) {
      skipped += 1;
    } else {
      const urls = [];
      if (iconName) urls.push(`${yattaAssets}/${encodeURIComponent(iconName)}.png`);
      const enka = enkaItems[id];
      const enkaIcon = enka?.IconName || enka?.SideIconName;
      if (enkaIcon) urls.push(`https://enka.network/ui/${encodeURIComponent(enkaIcon)}.png`);

      let lastError;
      for (let index = 0; index < urls.length; index += 1) {
        try {
          const response = await request(urls[index]);
          const bytes = Buffer.from(await response.arrayBuffer());
          await sharp(bytes).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 86 }).toFile(imageFile);
          imageReady = true;
          downloaded += 1;
          if (index > 0) fallbackCount += 1;
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!imageReady) console.warn(`No icon for ${item.name} (${id})${lastError ? `: ${lastError.message}` : ''}`);
    }

    const previous = records.get(id);
    records.set(id, {
      id,
      name: item.name,
      element: elementNames[item.element] || item.element || previous?.element || 'Unknown',
      weaponType: weaponNames[item.weaponType] || item.weaponType || previous?.weaponType || 'Unknown',
      rarity: Number(item.rank || item.rarity || previous?.rarity || 0),
      icon: imageReady ? `/images/characters/${id}.webp` : previous?.icon || null,
    });

    if ((downloaded + skipped) % 25 === 0) console.log(`Processed ${downloaded + skipped}/${characters.length} characters...`);
  }

  const output = [...records.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  await writeFile(dataFile, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Saved ${output.length} characters to ${dataFile}`);
  console.log(`Images: ${downloaded} downloaded, ${skipped} already present, ${fallbackCount} from Enka fallback`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
