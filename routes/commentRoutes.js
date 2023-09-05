const express = require("express");
const router = express.Router();
const { commentController } = require("../controller/index");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");
const {
  userVerifiedMiddleware,
} = require("../middleware/userVerifiedMiddleware");

router.post(
  "/insert",
  authenticationUserMiddleware,
  userVerifiedMiddleware,
  commentController.insert
);

module.exports = router;
