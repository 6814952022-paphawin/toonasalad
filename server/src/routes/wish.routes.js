const express = require("express");
const { getHistory, addWishes, importFromUrl } = require("../controllers/wish.controller");
const router = express.Router();
router.get("/", getHistory);
router.post("/", addWishes);
router.post("/import", importFromUrl);
module.exports = router;
