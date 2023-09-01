const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
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
  try {
    const releaseCounts = await chartModel.movieDetailChart(
      genres_id,
      threeYearsAgo
    );

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      movie: releaseCounts,
    });
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const movieRevenue = async (req, res) => {
  try {
    const revenue = await chartModel.movieRevenue();
    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      revenue: revenue,
    });
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const movieRevenueCountryWise = async (req, res) => {
  try {
    const { country } = req.body;
    const revenue = await chartModel.movieRevenueCountryWise(country);
    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      county_revenue: revenue,
    });
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const getGenreNameById = async (genreId) => {
  try {
    const genre = await getGenreName(genreId);
    return genre;
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// const movieGenresRating = async (req, res) => {
//   const { watch_list_id } = req.body;
//   let watch_list = [];

//   try {
//     const watchList = await chartModel.movieGenresRating(
//       req.user.id,
//       watch_list_id
//     );

//     if (watchList && watchList.movies) {
//       watch_list.push(watchList);

//       const movieIds = JSON.parse(watchList.movies);
//       const genreCounts = await chartModel.genreCounts(movieIds);

//       const flattenedGenreIds = genreCounts
//         .map((genreIds) => JSON.parse(genreIds))
//         .flat();

//       const genreCountMap = flattenedGenreIds.reduce((acc, genreId) => {
//         acc[genreId] = (acc[genreId] || 0) + 1;
//         return acc;
//       }, {});
//       const genreCountArray = Object.keys(genreCountMap).map((genreId) => ({
//         genre_id: parseInt(genreId),
//         genre_name: getGenreNameById(genreId),
//         genre_count: genreCountMap[genreId],
//       }));
//       await Promise.all(genreCountArray);
//       if (genreCounts.length > 0) {
//         sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
//           genreCountArray,
//         });
//       } else {
//         sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
//           message: "No movie details found for the given movie IDs.",
//         });
//       }
//     } else {
//       sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
//         message: "Watch list not found or movies array is missing.",
//       });
//     }
//   } catch (error) {
//     sendResponse(
//       res,
//       StatusCodes.INTERNAL_SERVER_ERROR,
//       ReasonPhrases.INTERNAL_SERVER_ERROR,
//       error.message
//     );
//   }
// };
const movieGenresRating = async (req, res) => {
  const { watch_list_id } = req.body;
  let watch_list = [];

  try {
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
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          genreCountArray,
        });
      } else {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "No movie details found for the given movie IDs.",
        });
      }
    } else {
      sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list not found or movies array is missing.",
      });
    }
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

module.exports = { movieGenresRating };

module.exports = {
  movieDetailChart,
  movieRevenue,
  movieRevenueCountryWise,
  movieGenresRating,
};
