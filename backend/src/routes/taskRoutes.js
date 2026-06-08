const express = require("express");

const taskController = require("../controllers/taskController");
const { authenticate, requirePresident } = require("../middlewares/authMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(taskController.index));
router.post("/", authenticate, requirePresident, asyncHandler(taskController.create));
router.patch("/:id", authenticate, asyncHandler(taskController.update));
router.delete("/:id", authenticate, requirePresident, asyncHandler(taskController.destroy));

module.exports = router;
