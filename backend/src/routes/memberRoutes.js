const express = require("express");

const memberController = require("../controllers/memberController");
const { authenticate, requirePresident } = require("../middlewares/authMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(memberController.index));
router.post("/", authenticate, requirePresident, asyncHandler(memberController.create));
router.delete("/:id", authenticate, requirePresident, asyncHandler(memberController.destroy));

module.exports = router;
