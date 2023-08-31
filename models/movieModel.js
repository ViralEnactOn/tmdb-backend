const db = require("../config/db");

const all_movie_details = async () => {
  const movie = await db.from("movie");
  return movie;
};

const pagination_movie_details = async (page, limit) => {
  const movie = await db
    .from("movie")
    .offset(page === "1" ? 0 : (page - 1) * limit)
    .limit(limit);
  return movie;
};

const movie_details = async (movieIds) => {
  const movie = await db("movie").whereIn("id", movieIds);
  return movie;
};

module.exports = {
  all_movie_details,
  movie_details,
  pagination_movie_details,
};
