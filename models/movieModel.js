const db = require("../config/db");
const user_rating_exist = async () => {
  const movie = await db.schema.hasTable("user_rating");
  return movie;
};

const user_comment_exist = async () => {
  const movie = await db.schema.hasTable("user_comment");
  return movie;
};

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
const movie_genres_rating = async (genres_id) => {
  const movie = await db("movie")
    .select("*")
    .whereRaw("genre_ids LIKE ?", `%${genres_id}%`)
    .orderBy("vote_average", "desc");
  return movie;
};

const movie_user_rating = async (id, movie_id, type, rating) => {
  const movie = await db("user_rating").insert({
    user_id: id,
    movie_id: movie_id,
    type: type,
    rating: rating,
  });
  return movie;
};

const movie_user_comment = async (id, movie_id, comment) => {
  const movie = await db("user_comment").insert({
    movie_id: movie_id,
    user_id: id,
    text: comment,
  });
  return movie;
};

const movie_user_nested_comment = async (
  id,
  movie_id,
  comment,
  parent_comment_id
) => {
  const movie = await db("user_comment").insert({
    movie_id: movie_id,
    user_id: id,
    text: comment,
    parent_comment_id: parent_comment_id,
  });
  return movie;
};

const movie_detail_chart = async (genres_id, threeYearsAgo) => {
  const movie = await db("movie")
    .select(
      db.raw(
        "YEAR(release_date) as year, WEEK(release_date) as week, COUNT(*) as movie_count"
      )
    )
    // .whereRaw(`FIND_IN_SET(${genres_id}, genre_ids)`)
    // .whereIn(
    //   db.raw('JSON_UNQUOTE(JSON_EXTRACT(genre_ids, "$[*]"))'),
    //   genres_id
    // )
    .where("release_date", ">=", threeYearsAgo)
    .groupBy(db.raw("YEAR(release_date), WEEK(release_date)"))
    .orderBy(db.raw("YEAR(release_date), WEEK(release_date)"));
  return movie;
};

const movie_revenue = async () => {
  const movie = await db("movie").select(
    "id",
    "title",
    "budget",
    "revenue",
    db.raw("(revenue - budget) as profit_loss"),
    db.raw('CASE WHEN revenue > budget THEN "Profit" ELSE "Loss" END as result')
  );
  return movie;
};

const movie_revenue_country_wise = async (country) => {
  const movie = await db("movie")
    .sum("revenue as total_revenue")
    .whereRaw(`JSON_CONTAINS(production_countries, ?)`, [`["${country}"]`])
    .then((movies) => {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        county_revenue: movies,
      });
    });
  return movie;
};

module.exports = {
  user_rating_exist,
  user_comment_exist,
  all_movie_details,
  movie_details,
  pagination_movie_details,
  movie_genres_rating,
  movie_user_rating,
  movie_user_comment,
  movie_user_nested_comment,
  movie_detail_chart,
  movie_revenue,
  movie_revenue_country_wise,
};
