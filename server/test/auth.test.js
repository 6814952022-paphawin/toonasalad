const test = require("node:test");
const assert = require("node:assert/strict");
const { hashPassword, verifyPassword, issueToken, readToken, validateCredentials } = require("../src/controllers/user.controller");

test("password hashes verify without storing the original password", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.notEqual(hash, "correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
  assert.equal(await verifyPassword("wrong password", hash), false);
});

test("signed tokens round trip and reject tampering", () => {
  const token = issueToken("user-123");
  assert.equal(readToken(token).sub, "user-123");
  assert.equal(readToken(`${token.slice(0, -1)}x`), null);
  assert.equal(readToken("bad-token"), null);
});

test("credential validation checks email and password length", () => {
  assert.equal(validateCredentials("player@example.com", "password123"), null);
  assert.match(validateCredentials("bad-email", "password123"), /email/i);
  assert.match(validateCredentials("player@example.com", "short"), /8 to 128/);
});
