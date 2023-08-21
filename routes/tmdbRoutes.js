const tmdbController = require("../controller/tmdbController");

const itemRoutes = (fastify, options, done) => {
  fastify.get("/getallmovie", tmdbController.get_movie_list);
  fastify.get("/discover/movie", tmdbController.get_movie);
  fastify.post("/register", tmdbController.register_user);
  // Authentication
  fastify.get("/user/verify/:id/:token", tmdbController.validate_user);
  fastify.post("/login", tmdbController.login_user);
  fastify.post("/user/forgot_password", tmdbController.forgot_password);
  fastify.get(
    "/user/reset_password/id=:id/token=:token",
    tmdbController.render_reset_password_template
  );
  fastify.post("/user/reset_password", tmdbController.reset_password);
  // Watch list
  fastify.post("/user/insert_watch_list", tmdbController.insert_watch_list);
  fastify.post("/user/fetch_watch_list", tmdbController.fetch_watch_list);
  fastify.post("/user/update_watch_list", tmdbController.update_watch_list);
  fastify.post("/user/delete_watch_list", tmdbController.delete_watch_list);

  // Movie in watch list
  fastify.post(
    "/user/insert_movie_watch_list",
    tmdbController.insert_movie_watch_list
  );
  fastify.get(
    "/user/fetch_movie_watch_list/watch_list_id=:watch_list_id/isPublic=:isPublic/user_id=:user_id",
    tmdbController.fetch_movie_watch_list
  );
  fastify.post(
    "/user/delete_movie_watch_list",
    tmdbController.delete_movie_watch_list
  );

  fastify.post(
    "/discover/movie_filter",
    tmdbController.fetch_movie_genres_rating
  );
  fastify.post("/user/movie_like", tmdbController.like_movie);
  fastify.post("/user/comment_movie", tmdbController.comment_movie);
  fastify.post("/user/insert_favorite", tmdbController.insert_favorite);
  fastify.post("/user/fetch_favorite_list", tmdbController.fetch_favorite_list);
  fastify.post(
    "/user/delete_favorite_list",
    tmdbController.delete_favorite_list
  );
  fastify.post("/user/nested_comment", tmdbController.nested_comment);
  fastify.post("/user/movie_chart", tmdbController.movie_chart);
  fastify.post("/user/movie_profit_loss", tmdbController.movie_profit_loss);
  done();
};
module.exports = itemRoutes;
