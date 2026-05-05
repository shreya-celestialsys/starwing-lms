const stack = document.getElementById("toastStack");
const DEFAULT_DURATION = 5000;

export function showNotification({ message, type = "info", duration = DEFAULT_DURATION }) {
  if (!stack) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const text = document.createElement("span");
  text.className = "toast__message";
  text.textContent = message;

  const dismiss = document.createElement("button");
  dismiss.className = "toast__dismiss";
  dismiss.type = "button";
  dismiss.setAttribute("aria-label", "Dismiss notification");
  dismiss.textContent = "×";

  toast.appendChild(text);
  toast.appendChild(dismiss);

  stack.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  const hide = () => dismissToast(toast);

  const timeoutId = setTimeout(hide, duration);

  dismiss.addEventListener("click", () => {
    clearTimeout(timeoutId);
    hide();
  });

  toast.addEventListener("mouseenter", () => {
    clearTimeout(timeoutId);
  });

  toast.addEventListener("mouseleave", () => {
    setTimeout(hide, 1500);
  });
}

export function notifyError(message) {
  showNotification({ message, type: "error" });
}

function dismissToast(toast) {
  const stack = getStack();
  toast.classList.remove("toast--visible");
  toast.addEventListener(
    "transitionend",
    () => {
      if (stack && toast.parentElement === stack) {
        stack.removeChild(toast);
      }
    },
    { once: true }
  );
}

function getStack() {
  return document.getElementById("toastStack");
}
