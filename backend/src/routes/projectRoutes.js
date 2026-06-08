const express = require("express");

const projectController = require("../controllers/projectController");
const { authenticate, requirePresident } = require("../middlewares/authMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(projectController.index));
router.post("/", authenticate, requirePresident, asyncHandler(projectController.create));
router.patch("/:id", authenticate, requirePresident, asyncHandler(projectController.update));

module.exports = router;
