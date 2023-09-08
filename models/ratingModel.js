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
  const ratings = await db("user_rating")
    .select("type")
    .avg("rating as average_rating")
    .where({
      movie_id: movie_id,
    })
    .groupBy("type");

  return ratings;
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
