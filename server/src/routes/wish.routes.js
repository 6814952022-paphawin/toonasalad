const express = require("express");
const { getHistory, addWishes } = require("../controllers/wish.controller");
const router = express.Router();
router.get("/", getHistory);
router.post("/", addWishes);
module.exports = router;
