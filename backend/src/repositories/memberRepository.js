const { all, get, run } = require("../database");

function findByUsername(username) {
  return get("SELECT * FROM members WHERE username = ?", [username]);
}

function findPublicById(id) {
  return get("SELECT id, name, username, role, created_at FROM members WHERE id = ?", [id]);
}

function listMembers() {
  return all("SELECT id, name, username, role, created_at FROM members ORDER BY role DESC, name ASC");
}

async function createMember({ name, username, passwordHash, role }) {
  const result = await run("INSERT INTO members (name, username, password_hash, role) VALUES (?, ?, ?, ?)", [
    name,
    username,
    passwordHash,
    role,
  ]);

  return findPublicById(result.lastID);
}

function deleteMember(id) {
  return run("DELETE FROM members WHERE id = ? AND role = 'membro'", [id]);
}

module.exports = {
  createMember,
  deleteMember,
  findByUsername,
  listMembers,
};
