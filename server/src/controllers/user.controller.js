const { randomBytes, scrypt: scryptCallback, timingSafeEqual, createHmac } = require("node:crypto");
const { promisify } = require("node:util");
const User = require("../models/user.model");
const scrypt = promisify(scryptCallback);

function tokenSecret() {
  if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be configured in production");
  return process.env.AUTH_SECRET || "local-development-only-change-me";
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [salt, value] = (stored || "").split(":");
  if (!salt || !value) return false;
  const expected = Buffer.from(value, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function issueToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: String(userId), exp: Date.now() + 7 * 86400000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", tokenSecret()).update(payload).digest("base64url")}`;
}

function readToken(token) {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", tokenSecret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    return claims.exp > Date.now() ? claims : null;
  } catch { return null; }
}

function validateCredentials(email, password) {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254) return "Enter a valid email address";
  if (typeof password !== "string" || password.length < 8 || password.length > 128) return "Password must be 8 to 128 characters";
  return null;
}

async function register(req, res, next) {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body?.password;
    const issue = validateCredentials(email, password);
    if (issue) return res.status(400).json({ message: issue });
    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ token: issueToken(user.id), user: { id: user.id, email: user.email } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists" });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body?.password;
    if (typeof password !== "string" || !email) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect" });
    res.json({ token: issueToken(user.id), user: { id: user.id, email: user.email } });
  } catch (error) { next(error); }
}

function currentUser(req, res, next) {
  const claims = readToken((req.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  if (!claims) return res.status(401).json({ message: "A valid bearer token is required" });
  User.findById(claims.sub).select("email").lean().then((user) => user ? res.json({ user: { id: user._id, email: user.email } }) : res.status(401).json({ message: "Account not found" })).catch(next);
}

module.exports = { register, login, currentUser, hashPassword, verifyPassword, issueToken, readToken, validateCredentials };
