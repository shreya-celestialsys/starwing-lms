import { elements, formControls } from "./dom.js";

export function openCourseDialog(course) {
  if (!elements.dialog || !elements.form) return;
  if (course) {
    elements.formTitle.textContent = "Update Course";
    elements.submitCourse.textContent = "Save Changes";
    formControls.title.value = course.title;
    formControls.instructor.value = course.instructor;
    formControls.category.value = course.category;
    formControls.level.value = course.level;
    formControls.status.value = course.status;
    formControls.duration.value = course.duration;
    formControls.description.value = course.description;
    formControls.tags.value = course.tags.join(", ");
  } else {
    elements.form.reset();
    elements.formTitle.textContent = "Create Course";
    elements.submitCourse.textContent = "Create";
  }

  if (typeof elements.dialog.showModal === "function") {
    elements.dialog.showModal();
  } else {
    elements.dialog.setAttribute("open", "");
  }
}

export function closeCourseDialog() {
  if (!elements.dialog || !elements.form) return;
  if (elements.dialog.open && typeof elements.dialog.close === "function") {
    elements.dialog.close();
  } else {
    elements.dialog.removeAttribute("open");
  }
  elements.form.reset();
}

export function readCourseForm() {
  return {
    title: formControls.title.value.trim(),
    instructor: formControls.instructor.value.trim(),
    category: formControls.category.value.trim(),
    level: formControls.level.value,
    status: formControls.status.value,
    duration: Number(formControls.duration.value),
    description: formControls.description.value.trim(),
    tags: formControls.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}
