require("dotenv").config();

// Some Windows/VPN DNS setups point Node at a local resolver that rejects SRV
// lookups. Set MONGO_DNS_SERVERS (comma-separated) to override it when needed.
const dnsServers = (process.env.MONGO_DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
if (dnsServers.length) require("node:dns").setServers(dnsServers);

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on
    http://localhost:${PORT}`));
});
