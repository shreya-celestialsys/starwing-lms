const TOKEN_KEY = "starwing-lms-token";
const USER_KEY = "starwing-lms-user";

const authState = {
  token: null,
  user: null,
};

const listeners = new Set();

export function initializeAuth() {
  try {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);
    if (storedToken) {
      authState.token = storedToken;
    }
    if (storedUser) {
      authState.user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("Unable to restore auth state", error);
    clearAuthState();
  }
  notifyListeners();
}

export function onAuthChange(listener) {
  listeners.add(listener);
  listener(getAuthSnapshot());
  return () => listeners.delete(listener);
}

export async function login(credentials) {
  const data = await authenticate("login", credentials);
  setAuthState(data.token, data.user);
  return getAuthSnapshot();
}

export async function register(details) {
  const data = await authenticate("register", details);
  setAuthState(data.token, data.user);
  return getAuthSnapshot();
}

export function logout() {
  clearAuthState();
  notifyListeners();
}

export function isAuthenticated() {
  return Boolean(authState.token);
}

export function getAuthToken() {
  return authState.token;
}

export function getCurrentUser() {
  return authState.user;
}

export function handleUnauthorized() {
  if (!authState.token) return;
  clearAuthState();
  notifyListeners();
}

function getAuthSnapshot() {
  return {
    token: authState.token,
    user: authState.user,
    isAuthenticated: Boolean(authState.token),
  };
}

function setAuthState(token, user) {
  authState.token = token;
  authState.user = user;

  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.warn("Unable to persist auth state", error);
  }

  notifyListeners();
}

function clearAuthState() {
  authState.token = null;
  authState.user = null;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.warn("Unable to clear auth storage", error);
  }
}

async function authenticate(path, payload) {
  const response = await fetch(`http://localhost:3000/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

async function extractErrorMessage(response) {
  try {
    const data = await response.json();
    if (data?.error) return data.error;
  } catch (error) {
    // ignore parse errors
  }
  if (response.status === 401) return "Invalid email or password";
  if (response.status === 409) return "An account with this email already exists";
  return "Authentication failed";
}

function notifyListeners() {
  const snapshot = getAuthSnapshot();
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("Auth listener failed", error);
    }
  });
}
