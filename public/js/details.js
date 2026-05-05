import { elements } from "./dom.js";
import { formatDuration, titleCase } from "./utils.js";

let currentCourse = null;

export function showCourseDetail(course) {
  if (!elements.detailDialog) return;
  const alreadyOpen = elements.detailDialog.open;
  renderDetailContent(course);
  if (alreadyOpen) {
    return;
  }
  if (typeof elements.detailDialog.showModal === "function") {
    elements.detailDialog.showModal();
  } else {
    elements.detailDialog.setAttribute("open", "");
  }
}

export function refreshCourseDetail(course) {
  if (!elements.detailDialog || !elements.detailDialog.open) return;
  renderDetailContent(course);
}

export function closeCourseDetail() {
  if (!elements.detailDialog) return;
  if (elements.detailDialog.open && typeof elements.detailDialog.close === "function") {
    elements.detailDialog.close();
  } else {
    elements.detailDialog.removeAttribute("open");
  }
  currentCourse = null;
}

export function getCurrentDetailCourse() {
  return currentCourse;
}

function renderDetailContent(course) {
  currentCourse = course;
  const level = course.level || "";
  const status = course.status || "";
  const durationLabel = formatDuration(course.duration);

  if (elements.detailTitle) {
    elements.detailTitle.textContent = course.title;
  }
  if (elements.detailSubtitle) {
    const subtitleParts = [course.instructor, course.category].filter(Boolean);
    elements.detailSubtitle.textContent = subtitleParts.join(" · ");
  }

  applyChip(elements.detailLevel, "chip chip-level", level, titleCase(level));
  applyChip(elements.detailStatus, "chip chip-status", status, titleCase(status));
  applyChip(elements.detailDuration, "chip", "", durationLabel);

  if (elements.detailDescription) {
    elements.detailDescription.textContent = course.description;
  }
  if (elements.detailInstructor) {
    elements.detailInstructor.textContent = course.instructor || "—";
  }
  if (elements.detailCategory) {
    elements.detailCategory.textContent = course.category || "—";
  }
  if (elements.detailStatusText) {
    elements.detailStatusText.textContent = titleCase(status);
  }
  if (elements.detailDurationText) {
    elements.detailDurationText.textContent = durationLabel;
  }

  if (elements.detailTags) {
    elements.detailTags.innerHTML = "";
    course.tags?.forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      elements.detailTags.appendChild(span);
    });
    if (!course.tags || course.tags.length === 0) {
      const span = document.createElement("span");
      span.textContent = "No tags";
      span.classList.add("detail-tag-empty");
      elements.detailTags.appendChild(span);
    }
  }
}

function applyChip(element, baseClass, slug, text) {
  if (!element) return;
  element.className = baseClass;
  if (slug) {
    element.classList.add(slug);
    if (baseClass.includes("level")) {
      element.dataset.level = slug;
    } else if (baseClass.includes("status")) {
      element.dataset.status = slug;
    }
  } else {
    delete element.dataset.level;
    delete element.dataset.status;
  }
  element.textContent = text;
}
