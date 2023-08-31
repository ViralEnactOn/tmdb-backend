const express = require("express");
const router = express.Router();
const watchlistController = require("../controller/watchlistController");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");

// Watch list CRUD
router.post(
  "/insert",
  authenticationUserMiddleware,
  watchlistController.insert
);
router.post(
  "/update",
  authenticationUserMiddleware,
  watchlistController.update
);
router.post(
  "/remove",
  authenticationUserMiddleware,
  watchlistController.remove
);
router.post("/fetch", authenticationUserMiddleware, watchlistController.fetch);

// Inside watch list movie CRUD
router.post(
  "/insertmovie",
  authenticationUserMiddleware,
  watchlistController.insertMovie
);
router.post(
  "/removemovie",
  authenticationUserMiddleware,
  watchlistController.removeMovie
);
router.get(
  "/fetchmovie/watch_list_id=:watch_list_id/isPublic=:isPublic/user_id=:user_id",
  watchlistController.fetchMovie
);

module.exports = router;
