const express = require("express");
const router = express.Router();
const watchlistController = require("../controller/watchlistController");

router.post("/insert", watchlistController.insert_watch_list);
router.post("/fetch", watchlistController.fetch_watch_list);

module.exports = router;
