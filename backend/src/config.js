const path = require("path");

module.exports = {
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, "..", "database.db"),
  jwtSecret: process.env.JWT_SECRET || "rotaract-manager-dev-secret",
};
