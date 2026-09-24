# Wish history API

Wish history is scoped by the client generated `x-player-id` value. This is an anonymous prototype identity, not an account or authentication system.

## `GET /api/wishes`

Requires `x-player-id`. Returns `totalPulls` and a `banners` object keyed by `character`, `weapon`, `standard`, `novice`, and `chronicled`. Each banner contains `totalPulls`, current `fivePity` and `fourPity`, last 4★/5★ records, and newest-first `wishes`.

## `POST /api/wishes`

Requires `x-player-id`. Accepts one wish or a batch of up to 5,000 records:

```json
{
  "wishes": [
    {
      "wishId": "optional-stable-source-id",
      "bannerType": "character",
      "itemId": "optional-game-item-id",
      "name": "Example character",
      "itemType": "character",
      "rarity": 5,
      "wishedAt": "2026-09-24T10:30:00Z"
    }
  ]
}
```

`bannerType` must be one of the five keys above; `itemType` is `character` or `weapon`; `rarity` is 3, 4, or 5. Stable `wishId` values are used to skip previously imported wishes. Response includes added/skipped counts and the updated summary.

Pity starts at the oldest available record. If the game has already expired older history, the reported pity is relative to the imported data and may differ from the in-game counter. Import currently accepts this normalized JSON format; it does not fetch the game's authenticated wish URL.
