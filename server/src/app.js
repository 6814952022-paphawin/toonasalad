const express = require("express");
const cors = require("cors");
const trackRoutes = require("./routes/track.routes");
const wishRoutes = require("./routes/wish.routes");
const userRoutes = require("./routes/user.routes");
const { uploadHandler } = require("./controllers/upload.controller");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const app = express();

// 1. Global middleware
app.use(cors());
app.use(express.json({ limit: "4mb" }));

// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tracks", trackRoutes);
app.use("/api/wishes", wishRoutes);
app.use("/api/auth", userRoutes);
app.post("/api/uploads/token", uploadHandler);

// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;
