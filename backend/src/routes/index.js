const express = require("express");

const authRoutes = require("./authRoutes");
const memberRoutes = require("./memberRoutes");
const projectRoutes = require("./projectRoutes");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

router.use(authRoutes);
router.use("/members", memberRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);

module.exports = { router };
