const db = require("../config/db");

const movieDetailChart = async (genres_id, threeYearsAgo) => {
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

const movieRevenue = async () => {
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

const movieRevenueCountryWise = async (country) => {
  const movie = await db("movie")
    .sum("revenue as total_revenue")
    .whereRaw(`JSON_CONTAINS(production_countries, ?)`, [`["${country}"]`]);

  return movie;
};

const movieGenresRating = async (user_id, watch_list_id) => {
  const movie = await db("user_watch_list")
    .where({
      id: watch_list_id,
      user_id: user_id,
      isDeleted: false,
    })
    .first();
  return movie;
};

const genreCounts = async (movieIds) => {
  // const getGenreNameById = async (genreId) => {
  //   console.log(genreId);
  //   const genre = await db("movie_genre_list")
  //     .where({
  //       id: genreId,
  //     })
  //     .first();
  //   console.log(genre.name);
  //   return genre ? genre.name : "";
  // };

  const genreCounts = await db("movie")
    .select(
      db.raw("JSON_UNQUOTE(JSON_EXTRACT(genre_ids, '$[*]')) AS genre_ids")
    )
    .whereIn("id", movieIds)
    .pluck("genre_ids");

  return genreCounts;

  // const flattenedGenreIds = genreCounts
  //   .map((genreIds) => JSON.parse(genreIds))
  //   .flat();
  // console.log(flattenedGenreIds);

  // const genreCountMap = flattenedGenreIds.reduce((acc, genreId) => {
  //   acc[genreId] = (acc[genreId] || 0) + 1;
  //   return acc;
  // }, {});

  // const genreCountArray = Object.keys(genreCountMap).map((genreId) => ({
  //   genre_id: parseInt(genreId),
  //   genre_name: getGenreNameById(genreId),
  //   genre_count: genreCountMap[genreId],
  // }));
  // return genreCountArray;
};

const getGenreName = async (genreIds) => {
  const movie = await db("movie_genre_list")
    .where({
      id: genreIds,
    })
    .first();
  return movie ? movie.name : "";
};

module.exports = {
  movieDetailChart,
  movieRevenue,
  movieRevenueCountryWise,
  movieGenresRating,
  genreCounts,
  getGenreName,
};
