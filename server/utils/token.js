const jwt = require("jsonwebtoken");

const TOKEN_TTL = process.env.JWT_TTL || "2h";
const JWT_SECRET = process.env.JWT_SECRET || "starwing-dev-secret";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  signToken,
  verifyToken,
};
