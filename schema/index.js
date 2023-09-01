const { userCommentSchema } = require("./userCommentSchema");
const { movieSchema } = require("./movieSchema");
const { userFavoriteMovieSchema } = require("./userFavoriteListSchema");
const { userSchema } = require("./userSchema");
const { userWatchListSchema } = require("./userWatchListSchema");
const { userReactionSchema } = require("./userReactionSchema");
const { userRatingSchema } = require("./userRatingSchema");
const { genreSchema } = require("./genreSchema");

module.exports = {
  userCommentSchema,
  movieSchema,
  userFavoriteMovieSchema,
  userSchema,
  userWatchListSchema,
  userReactionSchema,
  userRatingSchema,
  genreSchema,
};
