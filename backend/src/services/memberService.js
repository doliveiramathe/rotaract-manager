const bcrypt = require("bcryptjs");

const { createMember, deleteMember, listMembers } = require("../repositories/memberRepository");
const { httpError } = require("../utils/httpError");

function validateMemberInput({ name, username, password }) {
  if (!name || !username || !password) {
    throw httpError(400, "Nome, usuario e senha sao obrigatorios.");
  }
}

async function registerMember(input) {
  validateMemberInput(input);

  const passwordHash = await bcrypt.hash(input.password, 10);
  const role = input.role === "presidente" ? "presidente" : "membro";

  try {
    return await createMember({
      name: input.name.trim(),
      username: input.username.trim(),
      passwordHash,
      role,
    });
  } catch (error) {
    throw httpError(409, "Esse usuario ja existe.");
  }
}

async function removeMember({ memberId, currentUserId }) {
  if (Number(memberId) === Number(currentUserId)) {
    throw httpError(400, "Voce nao pode remover seu proprio acesso.");
  }

  await deleteMember(memberId);
}

module.exports = {
  listMembers,
  registerMember,
  removeMember,
};
