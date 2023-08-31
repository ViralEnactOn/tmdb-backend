const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const chartModel = require("../models/chartModel");

const movie_chart = async (req, res) => {
  const { genres_id } = req.body;
  const currentDate = new Date();
  const threeYearsAgo = new Date(
    currentDate.getFullYear() - 3,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  try {
    const releaseCounts = await chartModel.movie_detail_chart(
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

const movie_profit_loss = async (req, res) => {
  try {
    const revenue = await chartModel.movie_revenue();
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

const movie_country_revenue = async (req, res) => {
  try {
    const { country } = req.body;
    const revenue = await chartModel.movie_revenue_country_wise(country);
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

const genres_rating = async (req, res) => {
  const { genres_id } = req.body;

  try {
    // c. Show genere wise vote_average in the list
    const response = await chartModel.movie_genres_rating(genres_id);

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
  movie_chart,
  movie_profit_loss,
  movie_country_revenue,
  genres_rating,
};
