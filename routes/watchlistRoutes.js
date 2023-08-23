const express = require("express");
const router = express.Router();
const watchlistController = require("../controller/watchlistController");

// Watch list CRUD
router.post("/insert", watchlistController.insert_watch_list);
router.post("/update", watchlistController.update_watch_list);
router.post("/delete", watchlistController.delete_watch_list);
router.post("/fetch", watchlistController.fetch_watch_list);

// Inside watch list movie CRUD
router.post("/insertmovie", watchlistController.insert_movie);
router.post("/deletemovie", watchlistController.delete_movie);
router.get(
  "/fetchmovie/watch_list_id=:watch_list_id/isPublic=:isPublic/user_id=:user_id",
  watchlistController.fetch_movie
);

module.exports = router;
