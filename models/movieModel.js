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
  cursor,
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
  let query = db.from("movie");

  if (cursor) {
    query = query
      .where((builder) => {
        // Assuming your cursor is based on a unique column like "id"
        builder.where("id", ">", cursor);
      })
      .orderBy(newSortBy[0], newSortBy[1]);
  } else {
    // If no cursor is provided, simply apply the sorting
    query = query.orderBy(newSortBy[0], newSortBy[1]);
  }

  if (release_date_gte) {
    query = query.where("release_date", ">=", release_date_gte);
  }
  if (release_date_lte) {
    query = query.where("release_date", "<=", release_date_lte);
  }
  if (vote_average_gte) {
    query = query.where("vote_average", ">=", vote_average_gte);
  }
  if (vote_average_lte) {
    query = query.where("vote_average", "<=", vote_average_lte);
  }
  if (runtime_gte) {
    query = query.where("runtime", ">=", runtime_gte);
  }
  if (runtime_lte) {
    query = query.where("runtime", "<=", runtime_lte);
  }
  if (vote_count_gte) {
    query = query.where("vote_count", ">=", vote_count_gte);
  }
  if (vote_count_lte) {
    query = query.where("vote_count", "<=", vote_count_lte);
  }
  if (genre_ids) {
    const genreIdArray = genre_ids.split(",").map(Number);
    query = query.whereRaw("JSON_CONTAINS(genre_ids, ?)", [
      JSON.stringify(genreIdArray),
    ]);
  }

  query = query.limit(limit);

  const results = await query;

  return results;
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
