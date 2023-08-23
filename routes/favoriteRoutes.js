const express = require("express");
const router = express.Router();
const favoriteContoller = require("../controller/favoriteContoller");

router.post("/insert", favoriteContoller.insert_favorite);
router.post("/fetch", favoriteContoller.fetch_favorite);
router.post("/delete", favoriteContoller.delete_favorite);

module.exports = router;
