const projectService = require("../services/projectService");

async function index(req, res) {
  const projects = await projectService.listProjects();
  res.json({ projects });
}

async function create(req, res) {
  const project = await projectService.createProject(req.body);
  res.status(201).json({ project });
}

async function update(req, res) {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.json({ project });
}

module.exports = {
  create,
  index,
  update,
};
