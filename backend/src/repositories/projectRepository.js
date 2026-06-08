const { all, get, run } = require("../database");

function normalizeProject(row) {
  return {
    ...row,
    progress: row.total_tasks ? Math.round((row.done_tasks / row.total_tasks) * 100) : 0,
  };
}

async function listProjects() {
  const rows = await all(`
    SELECT
      p.*,
      COUNT(t.id) AS total_tasks,
      SUM(CASE WHEN t.status = 'realizada' THEN 1 ELSE 0 END) AS done_tasks
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY
      CASE p.status WHEN 'andamento' THEN 0 WHEN 'concluido' THEN 1 ELSE 2 END,
      p.start_date ASC
  `);

  return rows.map(normalizeProject);
}

async function createProject({ name, description, startDate, endDate, status }) {
  const result = await run(
    "INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)",
    [name, description, startDate, endDate, status]
  );

  return get("SELECT * FROM projects WHERE id = ?", [result.lastID]);
}

async function updateProject(id, { name, description, startDate, endDate, status }) {
  await run(
    `UPDATE projects
     SET name = COALESCE(?, name),
         description = COALESCE(?, description),
         start_date = COALESCE(?, start_date),
         end_date = COALESCE(?, end_date),
         status = COALESCE(?, status)
     WHERE id = ?`,
    [name, description, startDate, endDate, status, id]
  );

  return get("SELECT * FROM projects WHERE id = ?", [id]);
}

module.exports = {
  createProject,
  listProjects,
  updateProject,
};
