const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeWish, summarize } = require("../src/controllers/wish.controller");

test("normalizes a valid imported wish and rejects invalid rarity", () => {
  const wish = normalizeWish({ bannerType: "character", name: "Test", itemType: "character", rarity: "5", wishedAt: "2026-01-01T00:00:00Z" });
  assert.equal(wish.rarity, 5);
  assert.ok(wish.wishedAt instanceof Date);
  assert.throws(() => normalizeWish({ ...wish, rarity: 6 }), { name: "ValidationError" });
});

test("summarizes pity independently per banner and rarity", () => {
  const wishes = [
    { bannerType: "character", rarity: 3, name: "A", wishedAt: "2026-01-01" },
    { bannerType: "character", rarity: 4, name: "B", wishedAt: "2026-01-02" },
    { bannerType: "character", rarity: 3, name: "C", wishedAt: "2026-01-03" },
    { bannerType: "character", rarity: 5, name: "D", wishedAt: "2026-01-04" },
    { bannerType: "weapon", rarity: 3, name: "E", wishedAt: "2026-01-05" },
  ];
  const result = summarize(wishes);
  assert.equal(result.totalPulls, 5);
  assert.equal(result.banners.character.totalPulls, 4);
  assert.equal(result.banners.character.fivePity, 0);
  assert.equal(result.banners.character.fourPity, 0);
  assert.equal(result.banners.weapon.fivePity, 1);
  assert.equal(result.banners.weapon.fourPity, 1);
  assert.equal(result.banners.character.lastFive.name, "D");
});
