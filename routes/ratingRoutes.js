const express = require("express");
const router = express.Router();
const ratingController = require("../controller/ratingController");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");
const {
  authorizationMiddleware,
} = require("../middleware/authorizationMiddleware");

router.post(
  "/insert",
  authenticationUserMiddleware,
  authorizationMiddleware,
  ratingController.insert
);

module.exports = router;
