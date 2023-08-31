const {
  userCommentSchema,
  movieSchema,
  userFavoriteMovieSchema,
  userSchema,
  userWatchListSchema,
  userReactionSchema,
  userRatingSchema,
} = require("../schema/index");

const migrate = async () => {
  const movie = await movieSchema;
  const user = await userSchema;
  const userWatchList = await userWatchListSchema;
  const userFavoriteList = await userFavoriteMovieSchema;
  const userComment = await userCommentSchema;
  const userReaction = await userReactionSchema;
  const userRating = await userRatingSchema;
  console.log("Table Created Successfully");
};
migrate();
