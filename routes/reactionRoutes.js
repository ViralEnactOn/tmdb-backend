const express = require("express");
const router = express.Router();
const { reactionController } = require("../controller/index");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");
const {
  userVerifiedMiddleware,
} = require("../middleware/userVerifiedMiddleware");
router.post(
  "/fetch",
  authenticationUserMiddleware,
  userVerifiedMiddleware,
  reactionController.fetch
);
router.post(
  "/insert",
  authenticationUserMiddleware,
  userVerifiedMiddleware,
  reactionController.insert
);
router.post(
  "/remove",
  authenticationUserMiddleware,
  userVerifiedMiddleware,
  reactionController.remove
);

module.exports = router;
