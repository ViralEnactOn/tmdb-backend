const express = require("express");
const router = express.Router();
const { ratingController } = require("../controller/index");
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
  ratingController.insert
);

module.exports = router;
