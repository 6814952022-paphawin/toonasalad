const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pathname: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  contentType: { type: String, default: "application/json" },
}, { timestamps: true });

module.exports = mongoose.model("WishUpload", uploadSchema);
