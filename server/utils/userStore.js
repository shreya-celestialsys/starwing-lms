const fs = require("node:fs/promises");
const path = require("node:path");

const dataFile = path.join(__dirname, "..", "data", "users.json");

async function ensureDataFile() {
  try {
    await fs.access(dataFile);
  } catch (error) {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

async function readUsers() {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Unable to parse users.json, resetting to empty array.");
    return [];
  }
}

async function writeUsers(users) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(users, null, 2), "utf8");
}

module.exports = {
  readUsers,
  writeUsers,
};
