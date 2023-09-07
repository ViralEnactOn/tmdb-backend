const db = require("../config/db");

const insert = async (id, movie_id, type, rating) => {
  const movie = await db("user_rating").insert({
    user_id: id,
    movie_id: movie_id,
    type: type,
    rating: rating,
  });
  return movie;
};

const fetch = async (movie_id) => {
  const movie = await db("user_rating")
    .select(
      "user_rating.id as user_rating_id",
      "user_rating.movie_id as user_rating_movie_id",
      "user_rating.type as user_rating_type",
      "user_rating.rating as user_rating",
      "user.id as user_id",
      "user.name as user_name",
      "user.email as user_email"
    )
    .join("user", "user_rating.user_id", "user.id")
    .where({
      movie_id: movie_id,
    });
  return movie;
};

const getAll = async () => {
  const movie = await db("user_rating");
  return movie;
};

module.exports = {
  insert,
  fetch,
  getAll,
};
