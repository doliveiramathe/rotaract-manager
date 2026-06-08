const taskService = require("../services/taskService");

async function index(req, res) {
  const tasks = await taskService.listTasks({
    onlyMine: req.query.mine === "true",
    userId: req.user.id,
  });
  res.json({ tasks });
}

async function create(req, res) {
  const task = await taskService.createTask(req.body);
  res.status(201).json({ task });
}

async function update(req, res) {
  const task = await taskService.updateTask({
    taskId: Number(req.params.id),
    input: req.body,
    user: req.user,
  });
  res.json({ task });
}

async function destroy(req, res) {
  await taskService.deleteTask(req.params.id);
  res.status(204).send();
}

module.exports = {
  create,
  destroy,
  index,
  update,
};
