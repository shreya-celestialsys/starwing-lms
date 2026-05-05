import { API_BASE_URL } from "./constants.js";
import { getAuthToken, handleUnauthorized } from "./auth.js";

export async function fetchCourses(params) {
  const query = new URLSearchParams();
  if (params.search) query.set("q", params.search);
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.level && params.level !== "all") query.set("level", params.level);
  if (params.status && params.status !== "all") query.set("status", params.status);
  query.set("page", params.page);
  query.set("pageSize", params.pageSize);

  const response = await fetch(`${API_BASE_URL}?${query.toString()}`);
  await ensureOk(response);
  return response.json();
}

export async function createCourse(payload) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  await ensureOk(response);
  return response.json();
}

export async function replaceCourse(id, payload) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  await ensureOk(response);
  return response.json();
}

export async function updateCourse(id, payload) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  await ensureOk(response);
  return response.json();
}

export async function deleteCourse(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await ensureOk(response, 204);
}

async function ensureOk(response, expectedStatus) {
  if (expectedStatus && response.status === expectedStatus) return;
  if (response.ok) return;
  if (response.status === 401) {
    handleUnauthorized();
  }
  let message = "Request failed";
  try {
    const data = await response.json();
    if (data?.error) message = data.error;
  } catch (error) {
    // ignore JSON parse errors
  }
  if (response.status === 401) {
    message = "Please sign in to continue.";
  }
  throw new Error(message);
}

function authHeaders() {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
