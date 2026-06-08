const memberService = require("../services/memberService");

async function index(req, res) {
  const members = await memberService.listMembers();
  res.json({ members });
}

async function create(req, res) {
  const member = await memberService.registerMember(req.body);
  res.status(201).json({ member });
}

async function destroy(req, res) {
  await memberService.removeMember({
    memberId: req.params.id,
    currentUserId: req.user.id,
  });
  res.status(204).send();
}

module.exports = {
  create,
  destroy,
  index,
};
