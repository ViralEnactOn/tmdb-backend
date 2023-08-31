const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const chartModel = require("../models/chartModel");

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

const movieGenresRating = async (req, res) => {
  const { genres_id } = req.body;

  try {
    // c. Show genere wise vote_average in the list
    const response = await chartModel.movieGenresRating(genres_id);

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      movies: response,
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

module.exports = {
  movieDetailChart,
  movieRevenue,
  movieRevenueCountryWise,
  movieGenresRating,
};
