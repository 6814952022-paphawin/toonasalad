require("dotenv").config({ path: require("node:path").join(__dirname, "../server/.env") });
module.exports = require("../server/src/app");
