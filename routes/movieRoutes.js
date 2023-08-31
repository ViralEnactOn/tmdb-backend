const express = require("express");
const router = express.Router();
const movieController = require("../controller/movieController");

router.get("/getallmovie", movieController.get_movie_list);
router.get("/movie", movieController.movie);

module.exports = router;
