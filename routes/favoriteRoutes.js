const express = require("express");
const router = express.Router();
const { favoriteController } = require("../controller/index");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");

router.post("/insert", authenticationUserMiddleware, favoriteController.insert);
router.post("/fetch", authenticationUserMiddleware, favoriteController.fetch);
router.post("/delete", authenticationUserMiddleware, favoriteController.remove);

module.exports = router;
