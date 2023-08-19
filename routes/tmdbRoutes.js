const express = require("express");
const tmdbController = require("../controller/tmdbController");

const router = express.Router();

router.get("/getallmovie", tmdbController.get_movie_list);
router.get("/discover/movie", tmdbController.get_movie);
// Authentication
router.post("/register", tmdbController.register_user);
router.get("/user/verify/:id/:token", tmdbController.validate_user);
router.post("/login", tmdbController.login_user);
router.post("/user/forgot_password", tmdbController.forgot_password);
router.get(
  "/user/reset_password/:id/:token",
  tmdbController.render_reset_password_template
);
router.post("/user/reset_password", tmdbController.reset_password);
// Watch list
router.post("/user/insert_watch_list", tmdbController.insert_watch_list);
router.post("/user/fetch_watch_list", tmdbController.fetch_watch_list);
router.post("/user/update_watch_list", tmdbController.update_watch_list);
router.post("/user/delete_watch_list", tmdbController.delete_watch_list);
router.post("/user/delete_watch_list", tmdbController.delete_watch_list);

// Movie in watch list
router.post(
  "/user/insert_movie_watch_list",
  tmdbController.insert_movie_watch_list
);
router.get(
  "/user/fetch_movie_watch_list/watch_list_id=:watch_list_id/isPublic=:isPublic/user_id=:user_id",
  tmdbController.fetch_movie_watch_list
);
router.post(
  "/user/delete_movie_watch_list",
  tmdbController.delete_movie_watch_list
);

router.post("/discover/movie_filter", tmdbController.fetch_movie_genres_rating);
router.post("/user/movie_like", tmdbController.like_movie);
router.post("/user/comment_movie", tmdbController.comment_movie);
router.post("/user/insert_favorite", tmdbController.insert_favorite);
router.post("/user/fetch_favorite_list", tmdbController.fetch_favorite_list);
router.post("/user/delete_favorite_list", tmdbController.delete_favorite_list);
router.post("/user/nested_comment", tmdbController.nested_comment);
router.post("/user/movie_chart", tmdbController.movie_chart);
router.post("/user/movie_profit_loss", tmdbController.movie_profit_loss);

module.exports = router;
