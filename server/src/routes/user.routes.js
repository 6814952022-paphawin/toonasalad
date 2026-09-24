const express = require("express");
const { register, login, currentUser } = require("../controllers/user.controller");
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", currentUser);
module.exports = router;
