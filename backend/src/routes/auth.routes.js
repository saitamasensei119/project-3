/**
 * Auth Router
 * Các endpoint liên quan đến xác thực người dùng
 */

const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
