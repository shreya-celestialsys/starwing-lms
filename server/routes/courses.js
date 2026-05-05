const express = require("express");
const { requireAuth } = require('../middleware/authMiddleware')
const {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../services/courseService");

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    const result = listCourses(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const created = await createCourse(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const updated = await updateCourse(req.params.id, req.body, { partial: false });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const updated = await updateCourse(req.params.id, req.body, { partial: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await deleteCourse(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
