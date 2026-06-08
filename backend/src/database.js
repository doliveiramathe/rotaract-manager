const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();

const { databasePath } = require("./config");

function prepareDatabaseFile() {
  if (!fs.existsSync(databasePath)) return;

  const header = fs.readFileSync(databasePath).subarray(0, 16).toString("utf8");
  if (!header.startsWith("SQLite format 3")) {
    const backupPath = path.join(path.dirname(databasePath), `database.invalid-${Date.now()}.db`);
    fs.renameSync(databasePath, backupPath);
  }
}

prepareDatabaseFile();

const db = new sqlite3.Database(databasePath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function createTables() {
  await run("PRAGMA foreign_keys = ON");

  await run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('presidente', 'membro')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('andamento', 'concluido', 'cancelado')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'media' CHECK(priority IN ('baixa', 'media', 'alta')),
      status TEXT NOT NULL DEFAULT 'nao_realizada' CHECK(status IN ('nao_realizada', 'realizada')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS task_assignees (
      task_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      PRIMARY KEY(task_id, member_id),
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
    )
  `);
}

async function seedPresident() {
  const president = await get("SELECT id FROM members WHERE role = 'presidente' LIMIT 1");
  if (president) return;

  const passwordHash = await bcrypt.hash("admin123", 10);
  await run("INSERT INTO members (name, username, password_hash, role) VALUES (?, ?, ?, ?)", [
    "Presidente Rotaract",
    "presidente",
    passwordHash,
    "presidente",
  ]);
}

async function initDatabase() {
  await createTables();
  await seedPresident();
}

module.exports = {
  all,
  get,
  initDatabase,
  run,
};
