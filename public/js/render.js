import { elements } from "./dom.js";
import { formatDuration, titleCase } from "./utils.js";

export function renderFilterOptions(options, selected) {
  populateSelect(elements.categoryFilter, options.categories, selected.category);
  populateSelect(elements.levelFilter, options.levels, selected.level);
  populateSelect(elements.statusFilter, options.statuses, selected.status);
}

export function renderCourses(courses) {
  if (!elements.courseGrid || !elements.template) return;
  elements.courseGrid.innerHTML = "";

  if (!courses.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `<h3>Nothing here yet</h3><p>Try a different filter or add a new course to the catalog.</p>`;
    elements.courseGrid.appendChild(emptyState);
    return;
  }

  for (const course of courses) {
    const fragment = elements.template.content.cloneNode(true);
    const card = fragment.querySelector(".course-card");
    card.dataset.id = course.id;
    card.dataset.status = course.status;

    const levelChip = fragment.querySelector(".chip-level");
    levelChip.textContent = titleCase(course.level);
    levelChip.dataset.level = course.level;
    levelChip.classList.add(course.level);

    const statusChip = fragment.querySelector(".chip-status");
    statusChip.textContent = titleCase(course.status);
    statusChip.dataset.status = course.status;
    statusChip.classList.add(course.status);

    fragment.querySelector(".course-title").textContent = course.title;
    fragment.querySelector(".course-description").textContent = course.description;
    fragment.querySelector(".course-instructor").textContent = course.instructor;
    fragment.querySelector(".course-category").textContent = course.category;
    fragment.querySelector(".course-duration").textContent = formatDuration(course.duration);

    const tagsContainer = fragment.querySelector(".course-tags");
    course.tags.forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    elements.courseGrid.appendChild(fragment);
  }
}

export function renderSummary(pagination) {
  const { totalItems, page, pageSize } = pagination;
  if (!elements.resultSummary) return;
  if (!totalItems) {
    elements.resultSummary.textContent = "No courses match your current filters.";
    return;
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  elements.resultSummary.textContent = `Showing ${start}-${end} of ${totalItems} course${totalItems === 1 ? "" : "s"}.`;
}

export function renderStats(stats) {
  const { total, inProgress, completed } = stats;
  if (elements.statTotal) {
    elements.statTotal.textContent = `${total} course${total === 1 ? "" : "s"}`;
  }
  if (elements.statInProgress) {
    elements.statInProgress.textContent = `${inProgress} in progress`;
  }
  if (elements.statCompleted) {
    elements.statCompleted.textContent = `${completed} completed`;
  }
}

export function renderPagination(pagination) {
  const { totalPages, page } = pagination;
  if (!elements.pagination) return;
  elements.pagination.innerHTML = "";
  if (totalPages <= 1) {
    return;
  }

  elements.pagination.appendChild(createPageButton("Prev", page - 1, page === 1));

  for (let index = 1; index <= totalPages; index += 1) {
    const button = document.createElement("button");
    button.textContent = String(index);
    button.dataset.page = String(index);
    button.className = "page-number";
    if (index === page) {
      button.classList.add("active");
    }
    elements.pagination.appendChild(button);
  }

  elements.pagination.appendChild(createPageButton("Next", page, page === totalPages));
}

function populateSelect(select, values, selectedValue) {
  if (!select) return;
  select.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All";
  select.appendChild(allOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = titleCase(value);
    select.appendChild(option);
  });

  select.value = selectedValue || "all";
}

function createPageButton(label, page, disabled) {
  const button = document.createElement("button");
  button.textContent = label;
  button.dataset.page = String(page);
  if (disabled) {
    button.disabled = true;
  }
  return button;
}
