const WishHistory = require("../models/wish.model");
const { readToken } = require("./user.controller");

const BANNERS = ["character", "weapon", "standard", "chronicled"];
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

function summarize(wishes) {
  const banners = Object.fromEntries(BANNERS.map((banner) => {
    const rows = wishes.filter((wish) => wish.bannerType === banner).sort((a, b) => new Date(a.wishedAt) - new Date(b.wishedAt));
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
    res.status(201).json({ added: deduped.length, skipped: incoming.length - deduped.length, ...summarize(history.wishes) });
  } catch (error) { next(error); }
}

module.exports = { getHistory, addWishes, normalizeWish, summarize };
