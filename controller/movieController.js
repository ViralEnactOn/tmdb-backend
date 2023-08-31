const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { commentMovieSchema } = require("../schema/userCommentSchema");
const { likeMovieSchema } = require("../schema/userRatingSchema");
const movieModel = require("../models/movieModel");
const get_movie_list = async (req, res) => {
  try {
    const response = await movieModel.all_movie_details();

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

const movie = async (req, res) => {
  try {
    const { page } = req.query;
    const limit = 20;
    const response = await movieModel.pagination_movie_details(page, limit);

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

const genres_rating = async (req, res) => {
  const { genres_id } = req.body;

  try {
    // c. Show genere wise vote_average in the list
    const response = await movieModel.movie_genres_rating(genres_id);

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

const movie_rating = async (req, res) => {
  const { movie_id, type, rating } = req.body;

  try {
    try {
      await movieModel.movie_user_rating(req.user.id, movie_id, type, rating);

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Movie rating inserted successfully",
      });
    } catch (error) {
      sendResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
        error.message
      );
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

const comment_movie = async (req, res) => {
  const { movie_id, comment } = req.body;

  try {
    try {
      await movieModel.movie_user_comment(req.user.id, movie_id, comment);

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        commentId: "Comment inserted successfully",
      });
    } catch (error) {
      sendResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
        error.message
      );
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

const nested_comment = async (req, res) => {
  const { movie_id, comment, parent_comment_id } = req.body;
  try {
    await movieModel.movie_user_nested_comment(
      req.user.id,
      movie_id,
      comment,
      parent_comment_id
    );

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      message: "Nested comment inserted successfully",
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

const movie_chart = async (req, res) => {
  const { genres_id } = req.body;
  const currentDate = new Date();
  const threeYearsAgo = new Date(
    currentDate.getFullYear() - 3,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  try {
    const releaseCounts = await movieModel.movie_detail_chart(
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
    const revenue = await movieModel.movie_revenue();
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
    const revenue = await movieModel.movie_revenue_country_wise(country);

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

module.exports = {
  get_movie_list,
  movie,
  genres_rating,
  movie_rating,
  comment_movie,
  nested_comment,
  movie_chart,
  movie_profit_loss,
  movie_country_revenue,
};
