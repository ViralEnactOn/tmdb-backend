const { userCommentSchema } = require("./userCommentSchema");
const { movieSchema } = require("./movieSchema");
const { userFavoriteMovieSchema } = require("./userFavoriteListSchema");
const { userSchema } = require("./userSchema");
const { userWatchListSchema } = require("./userWatchListSchema");
const { userReactionSchema } = require("./userReactionSchema");
const { userRatingSchema } = require("./userRatingSchema");

module.exports = {
  userCommentSchema,
  movieSchema,
  userFavoriteMovieSchema,
  userSchema,
  userWatchListSchema,
  userReactionSchema,
  userRatingSchema,
};
