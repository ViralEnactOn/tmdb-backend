const express = require("express");
const router = express.Router();
const movieController = require("../controller/movieController");
const {
  authorizationMiddleware,
} = require("../middleware/authorizationMiddleware");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");

router.get("/getallmovie", movieController.get_movie_list);
router.get("/movie", movieController.movie);
router.post("/genrerating", movieController.genres_rating);
router.post(
  "/rating",
  authenticationUserMiddleware,
  authorizationMiddleware,
  movieController.movie_rating
);
router.post(
  "/comment",
  authenticationUserMiddleware,
  authorizationMiddleware,
  movieController.comment_movie
);
router.post(
  "/nested",
  authenticationUserMiddleware,
  authorizationMiddleware,
  movieController.nested_comment
);
router.post("/chart", movieController.movie_chart);
router.post("/revenue", movieController.movie_profit_loss);
router.post("/country_revenue", movieController.movie_country_revenue);

module.exports = router;
