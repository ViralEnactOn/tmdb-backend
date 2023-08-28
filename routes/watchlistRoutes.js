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
  watchlistController.insert_watch_list
);
router.post(
  "/update",
  authenticationUserMiddleware,
  watchlistController.update_watch_list
);
router.post(
  "/delete",
  authenticationUserMiddleware,
  watchlistController.delete_watch_list
);
router.post(
  "/fetch",
  authenticationUserMiddleware,
  watchlistController.fetch_watch_list
);

// Inside watch list movie CRUD
router.post(
  "/insertmovie",
  authenticationUserMiddleware,
  watchlistController.insert_movie
);
router.post(
  "/deletemovie",
  authenticationUserMiddleware,
  watchlistController.delete_movie
);
router.get(
  "/fetchmovie/watch_list_id=:watch_list_id/isPublic=:isPublic/user_id=:user_id",
  watchlistController.fetch_movie
);

module.exports = router;
