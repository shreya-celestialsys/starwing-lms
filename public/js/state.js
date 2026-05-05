import { DEFAULT_PAGE_SIZE } from "./constants.js";

export const state = {
  filters: {
    search: "",
    category: "all",
    level: "all",
    status: "all",
  },
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  courses: [],
  options: {
    categories: [],
    levels: [],
    statuses: [],
  },
  stats: {
    total: 0,
    inProgress: 0,
    completed: 0,
  },
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  },
  editingCourse: null,
};

export function setFilters(nextFilters) {
  state.filters = { ...state.filters, ...nextFilters };
  state.page = 1;
}

export function setPage(nextPage) {
  state.page = nextPage;
}

export function setEditingCourse(course) {
  state.editingCourse = course;
}

export function clearEditingCourse() {
  state.editingCourse = null;
}
