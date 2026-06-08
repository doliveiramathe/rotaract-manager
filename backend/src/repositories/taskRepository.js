const { all, get, run } = require("../database");

function parseAssignees(rawValue) {
  if (!rawValue) return [];

  return rawValue.split("|").map((item) => {
    const [id, ...name] = item.split(":");
    return { id: Number(id), name: name.join(":") };
  });
}

function normalizeTask(task) {
  return {
    ...task,
    assignees: parseAssignees(task.assignees_raw),
    assignees_raw: undefined,
  };
}

async function listTasks() {
  const rows = await all(`
    SELECT
      t.*,
      p.name AS project_name,
      p.start_date AS project_start_date,
      p.end_date AS project_end_date,
      p.status AS project_status,
      GROUP_CONCAT(m.id || ':' || m.name, '|') AS assignees_raw
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    LEFT JOIN task_assignees ta ON ta.task_id = t.id
    LEFT JOIN members m ON m.id = ta.member_id
    GROUP BY t.id
    ORDER BY p.start_date ASC, t.due_date ASC
  `);

  return rows.map(normalizeTask);
}

function findTaskById(id) {
  return get("SELECT * FROM tasks WHERE id = ?", [id]);
}

function findAssignment(taskId, memberId) {
  return get("SELECT 1 FROM task_assignees WHERE task_id = ? AND member_id = ?", [taskId, memberId]);
}

async function createTask({ projectId, title, description, dueDate, priority, status, memberIds }) {
  const result = await run(
    `INSERT INTO tasks (project_id, title, description, due_date, priority, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [projectId, title, description, dueDate, priority, status]
  );

  await replaceAssignees(result.lastID, memberIds);
  return findTaskWithAssignees(result.lastID);
}

async function updateTask(id, { title, description, dueDate, priority, status }) {
  await run(
    `UPDATE tasks
     SET title = COALESCE(?, title),
         description = COALESCE(?, description),
         due_date = COALESCE(?, due_date),
         priority = COALESCE(?, priority),
         status = COALESCE(?, status)
     WHERE id = ?`,
    [title, description, dueDate, priority, status, id]
  );
}

async function replaceAssignees(taskId, memberIds) {
  await run("DELETE FROM task_assignees WHERE task_id = ?", [taskId]);
  await Promise.all(
    memberIds.map((memberId) =>
      run("INSERT OR IGNORE INTO task_assignees (task_id, member_id) VALUES (?, ?)", [taskId, memberId])
    )
  );
}

async function findTaskWithAssignees(id) {
  return (await listTasks()).find((task) => task.id === Number(id));
}

function deleteTask(id) {
  return run("DELETE FROM tasks WHERE id = ?", [id]);
}

module.exports = {
  createTask,
  deleteTask,
  findAssignment,
  findTaskById,
  findTaskWithAssignees,
  listTasks,
  replaceAssignees,
  updateTask,
};
