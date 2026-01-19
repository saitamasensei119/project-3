const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/transaction.controller");

router.post("/", auth, controller.createTransaction);
router.get("/", auth, controller.getTransactions);
router.put("/:id", auth, controller.updateTransaction);
router.delete("/:id", auth, controller.deleteTransaction);

module.exports = router;
