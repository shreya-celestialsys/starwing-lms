const express = require("express");
const cors = require("cors");
const path = require("node:path");
const authRouter = require("./routes/auth");
const coursesRouter = require("./routes/courses");
const { initCourseStore } = require("./services/courseService");
const { initUserStore } = require("./services/userService");
const { HttpError } = require("./utils/httpError");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("*", (req, res, next) => {
  if (req.accepts("html")) {
    return res.sendFile(path.join(publicDir, "index.html"));
  }
  next(new HttpError(404, "Not found"));
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
});

async function start() {
  await Promise.all([initCourseStore(), initUserStore()]);
  app.listen(PORT, () => {
    console.log(`StarWing LMS server listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
