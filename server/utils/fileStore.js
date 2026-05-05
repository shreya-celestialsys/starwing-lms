const fs = require("node:fs/promises");
const path = require("node:path");

const dataFile = path.join(__dirname, "..", "data", "courses.json");

async function ensureDataFile() {
  try {
    await fs.access(dataFile);
  } catch (error) {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

async function readCourses() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Unable to parse courses.json, resetting to empty array.");
    return [];
  }
}

async function writeCourses(courses) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(courses, null, 2), "utf8");
}

module.exports = {
  readCourses,
  writeCourses,
};
