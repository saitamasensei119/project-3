const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/budgets.controller");

// Tạo budget
router.post("/", auth, controller.createBudget);

// Lấy budgets theo tháng
router.get("/", auth, controller.getBudgets);

//Cập nhật budget
router.put("/:id", auth, controller.updateBudget);

// Xoá budget
router.delete("/:id", auth, controller.deleteBudget);

module.exports = router;
