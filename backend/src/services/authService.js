const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { jwtSecret } = require("../config");
const { findByUsername } = require("../repositories/memberRepository");
const { httpError } = require("../utils/httpError");
const { toPublicUser } = require("../utils/userPresenter");

function createToken(user) {
  return jwt.sign(user, jwtSecret, { expiresIn: "8h" });
}

async function login({ username, password }) {
  const user = await findByUsername(username);
  const isValidPassword = user && (await bcrypt.compare(password || "", user.password_hash));

  if (!isValidPassword) {
    throw httpError(401, "Usuario ou senha invalidos.");
  }

  const publicUser = toPublicUser(user);
  return {
    token: createToken(publicUser),
    user: publicUser,
  };
}

module.exports = { login };
