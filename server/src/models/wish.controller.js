const WishHistory = require("../models/wish.model");
const { readToken } = require("./user.controller");

// "novice" was documented in WISH_API.md but missing here and in the model enum.
const BANNERS = ["novice", "standard", "character", "weapon", "chronicled"];

// ---- HoYoverse import config -------------------------------------------------
const API_BASE = "https://hk4e-api-os.hoyoverse.com/gacha_info/api/getGachaLog";
const GACHA_TYPE = { novice: 100, standard: 200, character: 301, weapon: 302, chronicled: 500 };
// The 301 query returns both 301 and 400 (character event banner 2) records.
const TYPE_TO_BANNER = { 100: "novice", 200: "standard", 301: "character", 400: "character", 302: "weapon", 500: "chronicled" };
const ALLOWED_HOST = /(^|\.)hoyoverse\.com$/;
const PAGE_SIZE = 20;
const MAX_PAGES_PER_REQUEST = 12; // keeps one request short enough for serverless timeouts
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const getPlayerId = (req) => {
  const bearer = (req.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const claims = bearer ? readToken(bearer) : null;
  return claims?.sub || req.get("x-player-id") || req.body?.playerId;
};

function normalizeWish(input) {
  const wish = {
    wishId: input.wishId == null ? undefined : String(input.wishId),
    bannerType: input.bannerType,
    itemId: input.itemId == null ? undefined : String(input.itemId),
    name: input.name,
    itemType: input.itemType,
    rarity: Number(input.rarity),
    wishedAt: new Date(input.wishedAt),
  };
  if (!BANNERS.includes(wish.bannerType) || !["character", "weapon"].includes(wish.itemType) || ![3, 4, 5].includes(wish.rarity) || !wish.name?.trim() || Number.isNaN(wish.wishedAt.getTime())) {
    const error = new Error("Each wish requires a valid bannerType, name, itemType, rarity (3/4/5), and wishedAt date");
    error.name = "ValidationError";
    throw error;
  }
  return wish;
}

// Wishes in one 10-pull share the same timestamp, so sorting by time alone can
// scramble them and give a wrong pity. Source wishIds increase with pull order,
// so prefer them and fall back to time only when ids are missing/non-numeric.
const isNumericId = (id) => typeof id === "string" && /^\d+$/.test(id);
function byPullOrder(a, b) {
  if (isNumericId(a.wishId) && isNumericId(b.wishId)) {
    const x = BigInt(a.wishId);
    const y = BigInt(b.wishId);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  return new Date(a.wishedAt) - new Date(b.wishedAt);
}

function summarize(wishes) {
  const banners = Object.fromEntries(BANNERS.map((banner) => {
    const rows = wishes.filter((wish) => wish.bannerType === banner).sort(byPullOrder);
    let fivePity = 0;
    let fourPity = 0;
    let lastFive = null;
    let lastFour = null;
    for (const wish of rows) {
      fivePity += 1;
      fourPity += 1;
      if (wish.rarity === 5) { fivePity = 0; lastFive = wish; }
      if (wish.rarity >= 4) { fourPity = 0; lastFour = wish; }
    }
    return [banner, { totalPulls: rows.length, fivePity, fourPity, lastFive, lastFour, wishes: rows.reverse() }];
  }));
  return { totalPulls: wishes.length, banners };
}

// Shared by POST /api/wishes and POST /api/wishes/import.
async function saveWishes(playerId, incoming) {
  const history = await WishHistory.findOneAndUpdate({ playerId }, { $setOnInsert: { playerId } }, { new: true, upsert: true });
  const known = new Set(history.wishes.filter((w) => w.wishId).map((w) => w.wishId));
  const unique = incoming.filter((w) => !w.wishId || !known.has(w.wishId));
  const keys = new Set();
  const deduped = unique.filter((w) => {
    if (!w.wishId) return true;
    if (keys.has(w.wishId)) return false;
    keys.add(w.wishId);
    return true;
  });
  if (deduped.length) history.wishes.push(...deduped);
  await history.save();
  return { added: deduped.length, skipped: incoming.length - deduped.length, history };
}

async function getHistory(req, res, next) {
  try {
    const playerId = getPlayerId(req);
    if (!playerId) return res.status(400).json({ message: "x-player-id header is required" });
    const history = await WishHistory.findOne({ playerId }).lean();
    const wishes = history?.wishes || [];
    res.json({ playerId, ...summarize(wishes) });
  } catch (error) { next(error); }
}

async function addWishes(req, res, next) {
  try {
    const playerId = getPlayerId(req);
    if (!playerId) return res.status(400).json({ message: "x-player-id header is required" });
    const inputs = Array.isArray(req.body?.wishes) ? req.body.wishes : [req.body];
    if (!inputs.length || inputs.length > 5000) return res.status(400).json({ message: "Provide between 1 and 5000 wishes" });
    const incoming = inputs.map(normalizeWish);
    const { added, skipped, history } = await saveWishes(playerId, incoming);
    res.status(201).json({ added, skipped, ...summarize(history.wishes) });
  } catch (error) { next(error); }
}

// ---- Import from the wish-history URL (output of getlink.ps1) ----------------

function parseWishUrl(raw) {
  let url;
  try { url = new URL(String(raw || "").trim()); } catch { throw httpError(400, "Invalid URL"); }
  // Never fetch the user's URL directly: only read its query params and call our fixed API_BASE.
  if (url.protocol !== "https:" || !ALLOWED_HOST.test(url.hostname)) throw httpError(400, "URL must be a HoYoverse wish history link");
  if (!url.searchParams.get("authkey")) throw httpError(400, "URL has no authkey");
  return url.searchParams;
}

async function fetchPages(params, banner, startEndId) {
  const rows = [];
  let endId = startEndId;
  let finished = false;

  for (let page = 0; page < MAX_PAGES_PER_REQUEST; page += 1) {
    const q = new URLSearchParams(params); // forward everything the game put in the link
    q.set("lang", "en");
    q.set("gacha_type", String(GACHA_TYPE[banner]));
    q.set("page", "1");
    q.set("size", String(PAGE_SIZE));
    q.set("end_id", endId);

    let body;
    try {
      body = await (await fetch(`${API_BASE}?${q}`)).json();
    } catch {
      throw httpError(502, "Could not reach the HoYoverse API");
    }
    if (body.retcode === -101) throw httpError(401, "authkey expired. Open the wish history in game and run the script again");
    if (body.retcode === -110) throw httpError(429, "Requested too frequently. Try again in a moment");
    if (body.retcode !== 0) throw httpError(502, body.message || "HoYoverse API error");

    const list = body.data?.list || [];
    if (!list.length) { finished = true; break; }
    rows.push(...list);
    endId = list[list.length - 1].id;
    if (list.length < PAGE_SIZE) { finished = true; break; }
    await sleep(350); // stay under the API rate limit
  }

  return { rows, nextEndId: finished ? null : endId };
}

function toWish(record) {
  return normalizeWish({
    wishId: record.id,
    bannerType: TYPE_TO_BANNER[record.gacha_type],
    itemId: record.item_id,
    name: record.name,
    itemType: String(record.item_type || "").toLowerCase(),
    rarity: record.rank_type,
    // The API time has no zone (it is the server's local time); stored as-is.
    wishedAt: `${String(record.time).replace(" ", "T")}Z`,
  });
}

// Body: { url, bannerType, endId? }. Fetches one slice of one banner and saves it.
// The client repeats the call with nextEndId until it is null, then moves to the next banner.
async function importFromUrl(req, res, next) {
  try {
    const playerId = getPlayerId(req);
    if (!playerId) return res.status(400).json({ message: "x-player-id header is required" });
    const bannerType = req.body?.bannerType;
    if (!Object.hasOwn(GACHA_TYPE, bannerType)) return res.status(400).json({ message: "bannerType must be one of " + BANNERS.join(", ") });
    const endId = /^\d+$/.test(String(req.body?.endId ?? "0")) ? String(req.body?.endId ?? "0") : "0";

    const params = parseWishUrl(req.body?.url); // authkey is used for this request only, never stored or logged
    const { rows, nextEndId } = await fetchPages(params, bannerType, endId);
    const { added, skipped } = await saveWishes(playerId, rows.map(toWish));

    res.status(201).json({ bannerType, fetched: rows.length, added, skipped, nextEndId });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
}

module.exports = { getHistory, addWishes, importFromUrl, normalizeWish, summarize };
