const { HttpError } = require("../utils/httpError");
const { verifyToken } = require("../utils/token");
const { findUserById, getSafeUser } = require("../services/userService");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentication required"));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    const payload = verifyToken(token);
    const user = findUserById(payload.sub);
    if (!user) {
      return next(new HttpError(401, "Account no longer exists"));
    }
    req.user = getSafeUser(user);
    return next();
  } catch (error) {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}

module.exports = {
  requireAuth,
};
