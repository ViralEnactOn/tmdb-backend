const db = require("../config/db");

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
    .whereRaw(`JSON_CONTAINS(production_countries, ?)`, [`["${country}"]`]);

  return movie;
};

const movie_genres_rating = async (genres_id) => {
  const movie = await db("movie")
    .select("*")
    .whereRaw("genre_ids LIKE ?", `%${genres_id}%`)
    .orderBy("vote_average", "desc");
  return movie;
};

module.exports = {
  movie_detail_chart,
  movie_revenue,
  movie_revenue_country_wise,
  movie_genres_rating,
};