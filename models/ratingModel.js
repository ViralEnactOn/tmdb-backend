const db = require("../config/db");

const movie_user_rating = async (id, movie_id, type, rating) => {
  const movie = await db("user_rating").insert({
    user_id: id,
    movie_id: movie_id,
    type: type,
    rating: rating,
  });
  return movie;
};

module.exports = {
  movie_user_rating,
};
