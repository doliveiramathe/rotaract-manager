const projectRepository = require("../repositories/projectRepository");
const { httpError } = require("../utils/httpError");

function validateProjectInput({ name, start_date, end_date }) {
  if (!name || !start_date || !end_date) {
    throw httpError(400, "Nome, inicio e fim do projeto sao obrigatorios.");
  }
}

function mapProjectInput(input) {
  return {
    name: input.name?.trim(),
    description: input.description?.trim() || "",
    startDate: input.start_date,
    endDate: input.end_date,
    status: input.status || "andamento",
  };
}

function mapProjectPatchInput(input) {
  return {
    name: input.name?.trim(),
    description: input.description?.trim(),
    startDate: input.start_date,
    endDate: input.end_date,
    status: input.status,
  };
}

function listProjects() {
  return projectRepository.listProjects();
}

function createProject(input) {
  validateProjectInput(input);
  return projectRepository.createProject(mapProjectInput(input));
}

function updateProject(id, input) {
  return projectRepository.updateProject(id, mapProjectPatchInput(input));
}

module.exports = {
  createProject,
  listProjects,
  updateProject,
};
