const express = require("express");
const tmdbController = require("../controller/tmdbController");

const router = express.Router();

router.get("/getallmovie", tmdbController.get_movie_list);
router.get("/discover/movie", tmdbController.get_movie);
router.post("/register", tmdbController.register_user);
router.get("/user/verify/:id/:token", tmdbController.validate_user);
router.post("/login", tmdbController.login_user);
router.post("/user/forgot_password", tmdbController.forgot_password);
router.get(
  "/user/reset_password/:id/:token",
  tmdbController.render_reset_password_template
);
router.post("/user/reset_password", tmdbController.reset_password);
router.post("/user/insert_watch_list", tmdbController.insert_watch_list);

module.exports = router;
