const express = require("express");
const router = express.Router();
const authenticationController = require("../controller/authenticationController");

router.post("/register", authenticationController.register_user);
router.get("/verify/:id/:token", authenticationController.validate_user);
router.post("/login", authenticationController.login_user);
router.post("/forgot_password", authenticationController.forgot_password);
router.get(
  "/reset_password/id=:id/token=:token",
  authenticationController.reset_password_template
);

router.post("/reset_password", authenticationController.reset_password);

module.exports = router;
