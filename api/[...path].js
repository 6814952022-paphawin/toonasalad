// Vercel injects configured environment variables into the function runtime.
// Load dotenv only from server/src/server.js for local Express development.
module.exports = require("../server/src/app");
