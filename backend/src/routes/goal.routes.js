const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/goal.controller");

router.post("/", auth, controller.createGoal);
router.get("/", auth, controller.getGoals);
router.put("/:id", auth, controller.updateGoal);
router.patch("/:id/progress", auth, controller.updateGoalProgress);
router.delete("/:id", auth, controller.deleteGoal);

module.exports = router;
