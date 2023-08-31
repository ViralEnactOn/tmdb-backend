const express = require("express");
const router = express.Router();
const { watchListController } = require("../controller/index");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");

// Watch list CRUD
router.post(
  "/insert",
  authenticationUserMiddleware,
  watchListController.insert
);
router.post(
  "/update",
  authenticationUserMiddleware,
  watchListController.update
);
router.post(
  "/remove",
  authenticationUserMiddleware,
  watchListController.remove
);
router.post("/fetch", authenticationUserMiddleware, watchListController.fetch);

// Inside watch list movie CRUD
router.post(
  "/insertmovie",
  authenticationUserMiddleware,
  watchListController.insertMovie
);
router.post(
  "/removemovie",
  authenticationUserMiddleware,
  watchListController.removeMovie
);
router.get(
  "/fetchmovie/watch_list_id=:watch_list_id/isPublic=:isPublic/user_id=:user_id",
  watchListController.fetchMovie
);

module.exports = router;
