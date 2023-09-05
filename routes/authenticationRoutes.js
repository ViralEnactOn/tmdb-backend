const express = require("express");
const router = express.Router();
const { authenticationController } = require("../controller/index");
const { authenticationUserMiddleware } = require("../middleware/index");

router.post("/register", authenticationController.register);
router.get("/verify/:token", authenticationController.verify);
router.post("/login", authenticationController.login);
router.post(
  "/view",
  authenticationUserMiddleware,
  authenticationController.view
);
router.post("/forgot_password", authenticationController.forgotPassword);
router.get(
  "/reset_password/token=:token",
  authenticationController.resetPasswordTemplate
);

router.post("/reset_password", authenticationController.resetPassword);

module.exports = router;
