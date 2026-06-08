const taskRepository = require("../repositories/taskRepository");
const { httpError } = require("../utils/httpError");

function validateTaskInput({ project_id, title, due_date, member_ids }) {
  if (!project_id || !title || !due_date || !member_ids?.length) {
    throw httpError(400, "Projeto, tarefa, prazo e responsáveis são obrigatórios.");
  }
}

function mapTaskInput(input) {
  return {
    projectId: input.project_id,
    title: input.title?.trim(),
    description: input.description?.trim() || "",
    dueDate: input.due_date,
    priority: input.priority || "media",
    status: input.status || "nao_realizada",
    memberIds: input.member_ids || [],
  };
}

function mapTaskPatchInput(input) {
  return {
    title: input.title?.trim(),
    description: input.description?.trim(),
    dueDate: input.due_date,
    priority: input.priority,
    status: input.status,
    completionDescription: input.completion_description?.trim(),
  };
}

function listTasks({ onlyMine, userId }) {
  return taskRepository.listTasks().then((tasks) => {
    if (!onlyMine) return tasks;
    return tasks.filter((task) => task.assignees.some((member) => member.id === userId));
  });
}

async function createTask(input) {
  validateTaskInput(input);
  return taskRepository.createTask(mapTaskInput(input));
}

async function updateTask({ taskId, input, user }) {
  const task = await taskRepository.findTaskById(taskId);
  if (!task) {
    throw httpError(404, "Tarefa não encontrada.");
  }

  if (user.role !== "presidente") {
    await validateMemberTaskUpdate({ taskId, input, memberId: user.id });
  }

  validateCompletionDescription(input);

  const mappedInput = mapTaskPatchInput(input);
  await taskRepository.updateTask(taskId, mappedInput);

  if (user.role === "presidente" && Array.isArray(input.member_ids)) {
    await taskRepository.replaceAssignees(taskId, input.member_ids);
  }

  return taskRepository.findTaskWithAssignees(taskId);
}

async function validateMemberTaskUpdate({ taskId, input, memberId }) {
  const assignment = await taskRepository.findAssignment(taskId, memberId);
  const changedFields = Object.keys(input);

  const allowedFields = ["status", "completion_description"];

  if (!assignment || changedFields.some((key) => !allowedFields.includes(key))) {
    throw httpError(403, "Você pode alterar apenas o status das suas tarefas.");
  }
}

function validateCompletionDescription(input) {
  if (input.status === "realizada" && !input.completion_description?.trim()) {
    throw httpError(400, "Informe uma descrição do que foi realizado.");
  }
}

module.exports = {
  createTask,
  deleteTask: taskRepository.deleteTask,
  listTasks,
  updateTask,
};
