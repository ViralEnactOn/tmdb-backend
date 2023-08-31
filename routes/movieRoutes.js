const express = require("express");
const router = express.Router();
const movieController = require("../controller/movieController");

router.get("/getall", movieController.getAll);
router.get("/pagination", movieController.pagination);

module.exports = router;
