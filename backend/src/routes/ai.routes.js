const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * Lấy insights cho tháng/năm
 * @route GET /api/ai-insights?month=1&year=2025
 */
router.get("/", authMiddleware, aiController.getInsights);

/**
 * Làm mới insights (tính toán lại)
 * @route POST /api/ai-insights/refresh
 */
router.post("/refresh", authMiddleware, aiController.refreshInsights);

module.exports = router;
