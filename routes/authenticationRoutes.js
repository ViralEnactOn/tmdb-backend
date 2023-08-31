const express = require("express");
const router = express.Router();
const authenticationController = require("../controller/authenticationController");

router.post("/register", authenticationController.register);
router.get("/verify/:token", authenticationController.verify);
router.post("/login", authenticationController.login);
router.post(
  "/forgot_password",
  // authenticationUserMiddleware, //TODO: Remove this middleware from here
  authenticationController.forgotPassword
);
router.get(
  "/reset_password/token=:token",
  authenticationController.resetPasswordTemplate
);

router.post(
  "/reset_password",
  // authenticationUserMiddleware, //TODO: Remove this middleware from here
  authenticationController.resetPassword
);

module.exports = router;
