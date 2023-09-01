const sendResponse = require("../config/responseUtil");
const { chartModel, movieModel } = require("../models/index");
const { getGenreName } = require("../models/chartModel");

const movieDetailChart = async (req, res) => {
  const { genres_id } = req.body;
  const currentDate = new Date();
  const threeYearsAgo = new Date(
    currentDate.getFullYear() - 3,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const releaseCounts = await chartModel.movieDetailChart(
    genres_id,
    threeYearsAgo
  );

  sendResponse(res, {
    movie: releaseCounts,
  });
};

const movieRevenue = async (req, res) => {
  const revenue = await chartModel.movieRevenue();
  sendResponse(res, {
    revenue: revenue,
  });
};

const movieRevenueCountryWise = async (req, res) => {
  const { country } = req.body;
  const revenue = await chartModel.movieRevenueCountryWise(country);
  sendResponse(res, {
    county_revenue: revenue,
  });
};

const getGenreNameById = async (genreId) => {
  const genre = await getGenreName(genreId);
  return genre;
};

const movieGenresRating = async (req, res) => {
  const { watch_list_id } = req.body;
  let watch_list = [];

  const watchList = await chartModel.movieGenresRating(
    req.user.id,
    watch_list_id
  );

  if (watchList && watchList.movies) {
    watch_list.push(watchList);

    const movieIds = JSON.parse(watchList.movies);
    const genreCounts = await chartModel.genreCounts(movieIds);

    const flattenedGenreIds = genreCounts
      .map((genreIds) => JSON.parse(genreIds))
      .flat();

    const genreCountMap = flattenedGenreIds.reduce((acc, genreId) => {
      acc[genreId] = (acc[genreId] || 0) + 1;
      return acc;
    }, {});

    // Create an array of promises to fetch genre names
    const genreNamePromises = Object.keys(genreCountMap).map(
      async (genreId) => ({
        genre_id: parseInt(genreId),
        genre_name: await getGenreNameById(genreId), // Assuming you have a function getGenreNameById to fetch genre names
        genre_count: genreCountMap[genreId],
      })
    );

    // Await all promises using Promise.all
    const genreCountArray = await Promise.all(genreNamePromises);

    if (genreCountArray.length > 0) {
      sendResponse(res, {
        genreCountArray,
      });
    } else {
      sendResponse(res, {
        message: "No movie details found for the given movie IDs.",
      });
    }
  } else {
    sendResponse(res, {
      message: "Watch list not found or movies array is missing.",
    });
  }
};

module.exports = { movieGenresRating };

module.exports = {
  movieDetailChart,
  movieRevenue,
  movieRevenueCountryWise,
  movieGenresRating,
};
