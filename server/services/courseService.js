const { randomUUID } = require("node:crypto");
const { readCourses, writeCourses } = require("../utils/fileStore");
const { HttpError } = require("../utils/httpError");

const STATUS_SEQUENCE = ["planned", "in-progress", "completed"];
const LEVELS = ["beginner", "intermediate", "advanced"];

let courses = [];

async function initCourseStore() {
  const loaded = await readCourses();
  // console.log("data loaded from json", loaded.length)
  courses = Array.isArray(loaded) ? loaded : [];
}

function listCourses(query = {}) {
  const search = (query.search || "").toLowerCase().trim();
  const category = (query.category || "all").toLowerCase();
  const level = (query.level || "all").toLowerCase();
  const status = (query.status || "all").toLowerCase();

  // console.log(search, category, level, status);

  const pageSize = clampNumber(parseInt(query.pageSize, 10) || 6, 1, 24);
  const requestedPage = Math.max(parseInt(query.page, 10) || 1, 1);
  // console.log(courses)

  const filtered = courses.filter((course) => {
    const tags = Array.isArray(course.tags) ? course.tags : [];
    const matchesSearch =
      !search ||
      course.title.toLowerCase().includes(search) ||
      course.instructor.toLowerCase().includes(search) ||
      tags.some((tag) => tag.toLowerCase().includes(search));

    const matchesCategory = category === "all" || course.category.toLowerCase() === category;
    const matchesLevel = level === "all" || course.level.toLowerCase() === level;
    const matchesStatus = status === "all" || course.status.toLowerCase() === status; //typo

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const totalItems = filtered.length;
  // console.log("filter item " , totalItems)
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize); //Math.floor to ceil
  const currentPage = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

//   console.log({
//   totalItems,
//   pageSize,
//   totalPages,
//   requestedPage,
// });

  return {
    data: pageItems,
    meta: {
      pagination: {
        page: currentPage,
        pageSize,
        totalItems,
        totalPages,
      },
      filters: getFilterOptions(),
      stats: getStats(),
    },
  };
}

async function createCourse(payload) {
  const course = sanitizeCoursePayload(payload, { partial: false });
  course.id = randomUUID();
  course.createdAt = new Date().toISOString();  //typo - () are missing
  courses.unshift(course);
  await persist();
  return course;
}

async function updateCourse(id, payload, { partial = false } = {}) {
  const index = courses.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new HttpError(404, "Course not found");
  }

  const updates = sanitizeCoursePayload(payload, { partial });
  const updatedCourse = { ...courses[index], ...updates, updatedAt: new Date().toISOString() };
  courses[index] = updatedCourse;
  await persist();
  return updatedCourse;
}

async function deleteCourse(id) {
  const index = courses.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new HttpError(404, "Course not found");
  }
  courses.splice(index, 1);
}

function getFilterOptions() {
  const categories = Array.from(new Set(courses.map((course) => course.category))).sort();
  const levels = Array.from(new Set(courses.map((course) => course.level))).sort(sortByLevel);
  const statuses = Array.from(new Set(courses.map((course) => course.status))).sort(sortByStatus);

  return { categories, levels, statuses };
}

function getStats() {
  const total = courses.length;
  const inProgress = courses.filter((course) => course.status === "in-progress").length;
  const completed = courses.filter((course) => course.status === "completed").length;

  return {
    total,
    inProgress,
    completed,
  };
}

function sanitizeCoursePayload(payload = {}, { partial }) {
  if (!partial) {
    assertRequired(payload, "title");
    assertRequired(payload, "instructor");
    assertRequired(payload, "category");
    assertRequired(payload, "level");
    assertRequired(payload, "status");
    assertRequired(payload, "duration");
    assertRequired(payload, "description");
  }

  const course = {};

  if (payload.title !== undefined) {
    course.title = String(payload.title).trim();
    if (!course.title) throw new HttpError(400, "Title is required");
  }

  if (payload.instructor !== undefined) {
    course.instructor = String(payload.instructor).trim();
    if (!course.instructor) throw new HttpError(400, "Instructor is required");
  }

  if (payload.category !== undefined) {
    course.category = String(payload.category).trim();
    if (!course.category) throw new HttpError(400, "Category is required");
  }

  if (payload.level !== undefined) {
    const level = String(payload.level).toLowerCase().trim();
    if (!LEVELS.includes(level)) {
      throw new HttpError(400, `Level must be one of: ${LEVELS.join(", ")}`);
    }
    course.level = level;
  }

  if (payload.status !== undefined) {
    const status = String(payload.status).toLowerCase().trim();
    if (!STATUS_SEQUENCE.includes(status)) {
      throw new HttpError(400, `Status must be one of: ${STATUS_SEQUENCE.join(", ")}`);
    }
    course.status = status;
  }

  if (payload.duration !== undefined) {
    const duration = Number(payload.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new HttpError(400, "Duration must be a number greater than zero");
    }
    course.duration = Math.round(duration);
  }

  if (payload.description !== undefined) {
    course.description = String(payload.description).trim();
    if (!course.description) throw new HttpError(400, "Description is required");
  }

  if (payload.tags !== undefined) {
    const tags = Array.isArray(payload.tags)
      ? payload.tags
      : String(payload.tags)
          .split(",")
          .map((tag) => tag.trim());
    course.tags = tags.filter(Boolean);
  }

  if (!partial && course.tags === undefined) {
    course.tags = [];
  }

  return course;
}

async function persist() {
  await writeCourses(courses);
}

function clampNumber(value, min, max) {
  return Math.max(Math.min(value, min), max);
}

function assertRequired(payload, key) {
  if (payload[key] === undefined || payload[key] === null || String(payload[key]).trim() === "") {
    throw new HttpError(400, `${capitalize(key)} is required`);
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sortByStatus(a, b) {
  return STATUS_SEQUENCE.indexOf(a) - STATUS_SEQUENCE.indexOf(b);
}

function sortByLevel(a, b) {
  return LEVELS.indexOf(a) - LEVELS.indexOf(b);
}

module.exports = {
  initCourseStore,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  STATUS_SEQUENCE,
};
