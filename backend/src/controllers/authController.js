const authService = require("../services/authService");

async function login(req, res) {
  const session = await authService.login(req.body);
  res.json(session);
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  login,
  me,
};
