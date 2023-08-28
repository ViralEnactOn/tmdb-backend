const express = require("express");
const router = express.Router();
const reactionContoller = require("../controller/reactionController");
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
  reactionContoller.insert_reaction
);
router.post(
  "/delete",
  authenticationUserMiddleware,
  authorizationMiddleware,
  reactionContoller.delete_reaction
);

module.exports = router;
