const express = require("express");
const router = express.Router();
const favoriteContoller = require("../controller/favoriteContoller");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");

router.post(
  "/insert",
  authenticationUserMiddleware,
  favoriteContoller.insert_favorite
);
router.post(
  "/fetch",
  authenticationUserMiddleware,
  favoriteContoller.fetch_favorite
);
router.post(
  "/delete",
  authenticationUserMiddleware,
  favoriteContoller.delete_favorite
);

module.exports = router;
