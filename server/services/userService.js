const { randomUUID } = require("node:crypto");
const bcrypt = require("bcryptjs");
const { readUsers, writeUsers } = require("../utils/userStore");
const { HttpError } = require("../utils/httpError");
const { signToken } = require("../utils/token");

let users = [];

async function initUserStore() {
  const stored = await readUsers();
  users = Array.isArray(stored) ? stored : [];
}

async function registerUser(payload = {}) {
  const name = String(payload.name || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "").trim();

  if (!name) throw new HttpError(400, "Name is required");
  if (!email) throw new HttpError(400, "Email is required");
  if (!isValidEmail(email)) throw new HttpError(400, "Email is not valid");
  if (!password || password.length < 6) {
    throw new HttpError(400, "Password must be at least 6 characters long");
  }

  const existing = users.find((user) => user.email === email);
  if (existing) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await persist();

  return buildAuthResponse(user);
}

async function authenticateUser(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "").trim();

  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const user = users.find((item) => item.email === email);
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new HttpError(401, "Invalid email or password");
  }

  return buildAuthResponse(user);
}

function getSafeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function buildAuthResponse(user) {
  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  return {
    token,
    user: getSafeUser(user),
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

async function persist() {
  await writeUsers(users);
}

function findUserById(id) {
  return users.find((user) => user.id === id);
}

module.exports = {
  initUserStore,
  registerUser,
  authenticateUser,
  getSafeUser,
  findUserById,
};
