const express = require("express");
const router = express.Router();
const commentController = require("../controller/commentController");
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
  commentController.insert
);

module.exports = router;
