const mongoose = require("mongoose");

const wishSchema = new mongoose.Schema({
  wishId: { type: String, trim: true },
  bannerType: { type: String, enum: ["character", "weapon", "standard", "chronicled"], required: true },
  itemId: { type: String, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  itemType: { type: String, enum: ["character", "weapon"], required: true },
  rarity: { type: Number, enum: [3, 4, 5], required: true },
  wishedAt: { type: Date, required: true },
}, { _id: false });

const wishHistorySchema = new mongoose.Schema({
  playerId: { type: String, required: true, trim: true, maxlength: 80 },
  wishes: { type: [wishSchema], default: [] },
}, { timestamps: true });

wishHistorySchema.index({ playerId: 1 }, { unique: true });
wishHistorySchema.index({ playerId: 1, "wishes.wishedAt": -1 });

module.exports = mongoose.model("WishHistory", wishHistorySchema);
