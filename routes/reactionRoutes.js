const express = require("express");
const router = express.Router();
const { reactionController } = require("../controller/index");
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
  reactionController.insert
);
router.post(
  "/remove",
  authenticationUserMiddleware,
  authorizationMiddleware,
  reactionController.remove
);

module.exports = router;
