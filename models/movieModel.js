const db = require("../config/db");

const getAll = async () => {
  const movie = await db.from("movie");
  return movie;
};

const pagination = async (page, limit) => {
  const movie = await db
    .from("movie")
    .offset(page === "1" ? 0 : (page - 1) * limit)
    .limit(limit);
  return movie;
};

const getDetails = async (movieIds) => {
  const movie = await db("movie").whereIn("id", movieIds);
  return movie;
};

module.exports = {
  getAll,
  pagination,
  getDetails,
};
