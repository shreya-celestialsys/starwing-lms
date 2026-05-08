import { elements } from "./dom.js";
import { openCourseDialog, closeCourseDialog, readCourseForm } from "./dialog.js";
import { state, setFilters, setPage, setEditingCourse, clearEditingCourse } from "./state.js";
import { renderCourses, renderFilterOptions, renderPagination, renderStats, renderSummary } from "./render.js";
import { fetchCourses, createCourse, updateCourse, deleteCourse } from "./api.js";
import { debounce, handleError } from "./utils.js";
import { initializeAuth, onAuthChange, login, register, logout as logoutUser, isAuthenticated } from "./auth.js";
import { initializeAuthUI, updateAuthUI, promptLogin } from "./auth-ui.js";
import { showNotification } from "./notifications.js";
import { showCourseDetail, closeCourseDetail, getCurrentDetailCourse, refreshCourseDetail } from "./details.js";

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}

function initialize() {
  initializeAuth();
  initializeAuthUI({ authenticate: handleAuthenticate, logout: handleLogout });
  onAuthChange(handleAuthStateChange);
  bindEvents();
  loadCourses();
}

async function loadCourses() {
  try {
    if (elements.resultSummary) {
      elements.resultSummary.textContent = "Loading courses…";
    }
    const response = await fetchCourses({
      ...state.filters,
      page: state.page,
      pageSize: state.pageSize,
    });

    state.courses = response.data;
    state.options = response.meta.filters;
    state.stats = response.meta.stats;
    state.pagination = response.meta.pagination;
    state.page = state.pagination.page;

    renderFilterOptions(state.options, state.filters);
    renderCourses(state.courses);
    renderSummary(state.pagination);
    renderStats(state.stats);
    renderPagination(state.pagination);
    if (elements.searchInput) {
      elements.searchInput.value = state.filters.search;
    }
  } catch (error) {
    handleError(error);
  }
}

function bindEvents() {
  const debouncedSearch = debounce((value) => {
    setFilters({ search: value.trim() });
    loadCourses();
  }, 220);

  listen(elements.searchInput, "input", (event) => {
    debouncedSearch(event.target.value);
  });

  listen(elements.categoryFilter, "change", (event) => {
    setFilters({ category: event.target.value });
    loadCourses();
  });

  listen(elements.levelFilter, "change", (event) => {
    setFilters({ level: event.target.value });
    loadCourses();
  });

  listen(elements.statusFilter, "change", (event) => {
    setFilters({ status: event.target.value });
    loadCourses();
  });

  listen(elements.openNewCourse, "click", () => {
    if (!isAuthenticated()) {
      promptLogin("Sign in to add new courses.");
      return;
    }
    clearEditingCourse();
    openCourseDialog(null);
  });

  listen(elements.cancelDialog, "click", () => {
    clearEditingCourse();
    closeCourseDialog();
  });

  listen(elements.form, "submit", async (event) => {
    event.preventDefault();
    if (!isAuthenticated()) {
      promptLogin("Sign in to save course changes.");
      return;
    }
    try {
      const payload = readCourseForm();
      if (state.editingCourse) {
        await updateCourse(state.editingCourse.id, payload);
      } else {
        await createCourse(payload);
      }
      closeCourseDialog();
      clearEditingCourse();
      await loadCourses();
    } catch (error) {
      handleError(error);
    }
  });

  listen(elements.pagination, "click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled) return;
    const nextPage = Number.parseInt(button.dataset.page, 10);
    if (Number.isNaN(nextPage) || nextPage < 1 || nextPage === state.page) return;
    setPage(nextPage);
    loadCourses();
  });

  listen(elements.courseGrid, "click", async (event) => {
    event.preventDefault();
    const card = event.target.closest(".course-card");
    if (!card) return;
    const courseId = card.dataset.id;
    const course = state.courses.find((item) => item.id === courseId);
    if (!course) return;

    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) {
      showCourseDetail(course);
      return;
    }

    if (!isAuthenticated()) {
      promptLogin("Sign in to manage courses.");
      return;
    }

    const action = actionButton.dataset.action;
    if (action === "edit") {
      closeCourseDetail();
      setEditingCourse(course);
      openCourseDialog(course);
      return;
    }

    if (action === "delete") {
      if (window.confirm(`Delete “${course.title}”? This action cannot be undone.`)) {
        try {
          closeCourseDetail();
          await deleteCourse(course.id);
          await loadCourses();
        } catch (error) {
          handleError(error);
        }
      }
      return;
    }

    // no other actions
  });

  listen(elements.dialog, "close", () => {
    clearEditingCourse();
  });

  listen(elements.detailClose, "click", () => {
    closeCourseDetail();
  });

  listen(elements.detailDialog, "cancel", (event) => {
    event.preventDefault();
    closeCourseDetail();
  });

  listen(elements.detailDialog, "close", () => {
    // currentCourse reset inside closeCourseDetail
  });

  listen(elements.detailEdit, "click", () => {
    const course = getCurrentDetailCourse();
    if (!course) return;
    if (!isAuthenticated()) {
      closeCourseDetail();
      promptLogin("Sign in to edit courses.");
      return;
    }
    closeCourseDetail();
    setEditingCourse(course);
    openCourseDialog(course);
  });

  listen(elements.detailDelete, "click", async () => {
    const course = getCurrentDetailCourse();
    if (!course) return;
    if (!isAuthenticated()) {
      closeCourseDetail();
      promptLogin("Sign in to delete courses.");
      return;
    }
    const confirmed = window.confirm(`Delete “${course.title}”? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      closeCourseDetail();
      await deleteCourse(course.id);
      await loadCourses();
    } catch (error) {
      handleError(error);
    }
  });
}

async function handleAuthenticate(mode, payload) {
  if (mode === "login") {
    const snapshot = await login(payload);
    showNotification({ message: `Welcome back, ${getFriendlyName(snapshot.user)}!` });
  } else {
    const snapshot = await register(payload);
    showNotification({ message: `Account ready, ${getFriendlyName(snapshot.user)}!` });
  }
  await loadCourses();
}

function handleLogout() {
  logoutUser();
  closeCourseDialog();
  clearEditingCourse();
  closeCourseDetail();
  showNotification({ message: "Signed out successfully." });
}

function handleAuthStateChange(authState) {
  updateAuthUI(authState);
  if (elements.openNewCourse) {
    elements.openNewCourse.title = authState.isAuthenticated
      ? "Add a new course"
      : "Sign in to add courses";
  }
  if (!authState.isAuthenticated) {
    closeCourseDialog();
    clearEditingCourse();
    closeCourseDetail();
  }
  const detailControls = [elements.detailEdit, elements.detailDelete];
  detailControls.forEach((button) => {
    if (!button) return;
    button.hidden = authState.isAuthenticated;
  });
}

function getFriendlyName(user) {
  if (!user) return "Crew Member";
  return user.name || user.email || "Crew Member";
}

function listen(target, event, handler) {
  if (!target) return;
  target.addEventListener(event, handler, { passive: true });
}
