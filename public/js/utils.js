export function titleCase(value = "") {
  return value
    .split(/\s|-/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function formatDuration(hours) {
  const value = Number(hours) || 0;
  return `${value} hr${value === 1 ? "" : "s"}`;
}

export function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function handleError(error) {
  console.error(error);
  const message = error?.message || "Something went wrong. Please try again.";
  notifyError(message);
}
