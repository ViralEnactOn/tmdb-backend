const db = require("../config/db");

const getAll = async () => {
  const movie = await db.from("movie");
  return movie;
};

const detail = async (id) => {
  const movie = await db.from("movie").where({ id: id });
  return movie;
};

const pagination = async (
  page,
  limit,
  newSortBy,
  release_date_gte,
  release_date_lte,
  vote_average_gte,
  vote_average_lte,
  runtime_gte,
  runtime_lte,
  vote_count_gte,
  vote_count_lte,
  genre_ids
) => {
  const movie = await db
    .from("movie")
    .where((builder) => {
      if (release_date_gte) {
        builder.where("release_date", ">=", release_date_gte);
      }
      if (release_date_lte) {
        builder.where("release_date", "<=", release_date_lte);
      }
      if (vote_average_gte) {
        builder.where("vote_average", ">=", vote_average_gte);
      }
      if (vote_average_lte) {
        builder.where("vote_average", "<=", vote_average_lte);
      }
      if (runtime_gte) {
        builder.where("runtime", ">=", runtime_gte);
      }
      if (runtime_lte) {
        builder.where("runtime", "<=", runtime_lte);
      }
      if (vote_count_gte) {
        builder.where("vote_count", ">=", vote_count_gte);
      }
      if (vote_count_lte) {
        builder.where("vote_count", "<=", vote_count_lte);
      }
      if (genre_ids) {
        const genreIdArray = genre_ids.split(",").map(Number);
        builder.whereRaw("JSON_CONTAINS(genre_ids, ?)", [
          JSON.stringify(genreIdArray),
        ]);
      }
    })
    .orderBy(newSortBy[0], newSortBy[1])
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
  detail,
};
