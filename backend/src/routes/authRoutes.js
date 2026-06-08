const express = require("express");

const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");

const router = express.Router();

router.post("/login", asyncHandler(authController.login));
router.get("/me", authenticate, authController.me);

module.exports = router;
