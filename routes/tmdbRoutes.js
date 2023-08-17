const express = require("express");
const tmdbController = require("../controller/tmdbController");

const router = express.Router();

router.get("/getallmovie", tmdbController.get_movie_list);
router.get("/discover/movie", tmdbController.get_movie);
router.post("/register", tmdbController.register_user);
router.get("/user/verify/:id/:token", tmdbController.validate_user);

module.exports = router;
