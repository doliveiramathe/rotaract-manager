const jwt = require("jsonwebtoken");

const { jwtSecret } = require("../config");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Login necessario." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Sessao expirada. Entre novamente." });
  }
}

function requirePresident(req, res, next) {
  if (req.user.role !== "presidente") {
    return res.status(403).json({ error: "Acesso restrito ao presidente." });
  }

  return next();
}

module.exports = {
  authenticate,
  requirePresident,
};
