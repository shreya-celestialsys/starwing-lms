import { elements, authControls } from "./dom.js";

const DEFAULT_SUBTITLES = {
  login: "Access your course controls.",
  register: "Create an account to manage courses.",
};

const SWITCH_COPY = {
  login: {
    message: "No account yet?",
    action: "Create one",
  },
  register: {
    message: "Already have an account?",
    action: "Sign in",
  },
};

let currentMode = "login";

export function initializeAuthUI({ authenticate, logout }) {
  elements.openAuthDialog?.addEventListener("click", () => openDialog("login"));
  authControls.toggle?.addEventListener("click", () => toggleMode());
  authControls.cancel?.addEventListener("click", () => closeDialog());
  elements.logoutButton?.addEventListener("click", logout);

  elements.authForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      await authenticate(currentMode, readAuthForm());
      closeDialog();
    } catch (error) {
      setAuthError(error?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  });

  elements.authDialog?.addEventListener("close", () => {
    resetFormState();
  });

  resetFormState();
}

export function updateAuthUI({ isAuthenticated, user }) {
  if (!elements.userGreeting || !elements.openAuthDialog || !elements.logoutButton) return;
  if (isAuthenticated) {
    const label = user?.name || user?.email || "Crew Member";
    elements.userGreeting.textContent = `Welcome, ${label}!`;
    elements.userGreeting.hidden = false;
    elements.openAuthDialog.hidden = true;
    elements.logoutButton.hidden = false;
  } else {
    elements.userGreeting.hidden = true;
    elements.openAuthDialog.hidden = false;
    elements.logoutButton.hidden = true;
  }
}

export function promptLogin(message) {
  openDialog("login", message || DEFAULT_SUBTITLES.login);
}

function toggleMode() {
  currentMode = currentMode === "login" ? "register" : "login";
  applyMode(currentMode);
  setAuthError("");
}

function openDialog(mode, subtitle) {
  currentMode = mode;
  applyMode(mode, subtitle);
  showDialog(elements.authDialog);
}

function closeDialog() {
  hideDialog(elements.authDialog);
  resetFormState();
}

function resetFormState() {
  currentMode = "login";
  elements.authForm?.reset();
  applyMode("login");
  setAuthError("");
}

function applyMode(mode, subtitle) {
  if (!elements.authFormTitle || !elements.authFormSubtitle || !authControls.submit || !elements.authSwitchMessage) {
    return;
  }

  const nameField = elements.authNameField;
  if (nameField) {
    if (mode === "register") {
      nameField.removeAttribute("hidden");
    } else {
      nameField.setAttribute("hidden", "");
    }
  }

  elements.authFormTitle.textContent = mode === "login" ? "Sign In" : "Create Account";
  elements.authFormSubtitle.textContent = subtitle || DEFAULT_SUBTITLES[mode];
  authControls.submit.textContent = mode === "login" ? "Sign In" : "Create Account";
  elements.authSwitchMessage.textContent = SWITCH_COPY[mode].message;
  authControls.toggle.textContent = SWITCH_COPY[mode].action;

  if (authControls.name) {
    authControls.name.required = mode === "register";
  }
  if (authControls.password) {
    authControls.password.setAttribute(
      "autocomplete",
      mode === "register" ? "new-password" : "current-password"
    );
  }
}

function readAuthForm() {
  return {
    name: authControls.name?.value?.trim() || "",
    email: authControls.email?.value?.trim() || "",
    password: authControls.password?.value || "",
  };
}

function setAuthError(message) {
  if (!elements.authError) return;
  elements.authError.textContent = message;
}

function setLoading(isLoading) {
  if (!authControls.submit) return;
  authControls.submit.disabled = isLoading;
  if (isLoading) {
    authControls.submit.dataset.state = "loading";
  } else {
    delete authControls.submit.dataset.state;
  }
  if (authControls.toggle) {
    authControls.toggle.disabled = isLoading;
  }
  if (authControls.cancel) {
    authControls.cancel.disabled = isLoading;
  }
  if (authControls.email) {
    authControls.email.disabled = isLoading;
  }
  if (authControls.password) {
    authControls.password.disabled = isLoading;
  }
  if (authControls.name) {
    authControls.name.disabled = isLoading && currentMode === "register";
  }
}

function showDialog(dialog) {
  if (!dialog) return;
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function hideDialog(dialog) {
  if (!dialog) return;
  if (dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}
