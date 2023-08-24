const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { commentMovieSchema } = require("../schema/commentMovieSchema");
const { likeMovieSchema } = require("../schema/likeMovieSchema");
const {
  verifyUserMiddleware,
} = require("../middleware/authenticationMiddleware");
const {
  all_movie_details,
  pagination_movie_details,
  movie_genres_rating,
  movie_user_rating,
  user_rating_exist,
  user_comment_exist,
  movie_user_comment,
  movie_user_nested_comment,
  movie_detail_chart,
  movie_revenue,
  movie_revenue_country_wise,
} = require("../models/movieModel");
const get_movie_list = async (req, res) => {
  try {
    const response = await all_movie_details();

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
    const response = await pagination_movie_details(page, limit);

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
    const response = await movie_genres_rating(genres_id);

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
    await verifyUserMiddleware(req, res, async () => {
      const movie_like = async () => {
        try {
          await movie_user_rating(req.user.id, movie_id, type, rating);

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
      };
      const exists = await user_rating_exist();
      if (!exists) {
        await likeMovieSchema.then(async (response) => {
          await movie_like();
        });
      } else {
        await movie_like();
      }
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

const comment_movie = async (req, res) => {
  const { movie_id, comment } = req.body;

  try {
    await verifyUserMiddleware(req, res, async () => {
      const movie_comment = async () => {
        try {
          await movie_user_comment(req.user.id, movie_id, comment);

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
      };
      const exists = await user_comment_exist();
      if (!exists) {
        await commentMovieSchema.then(async (response) => {
          await movie_comment();
        });
      } else {
        await movie_comment();
      }
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

const nested_comment = async (req, res) => {
  const { movie_id, comment, parent_comment_id } = req.body;
  try {
    await verifyUserMiddleware(req, res, async () => {
      await movie_user_nested_comment(
        req.user.id,
        movie_id,
        comment,
        parent_comment_id
      );

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Nested comment inserted successfully",
      });
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
    const releaseCounts = await movie_detail_chart(genres_id, threeYearsAgo);

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
    const revenue = await movie_revenue();
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
    const revenue = await movie_revenue_country_wise(country);

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
