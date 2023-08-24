const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");
const {
  insert_record,
  find_record,
  delete_record,
} = require("../models/favoriteModel");
const { movie_details } = require("../models/movieModel");

const insert_favorite = async (req, res) => {
  const { type, items } = req.body;
  try {
    await authenticationUserMiddleware(req, res, async () => {
      const updateResult = await insert_record(req.user.id, type, items);
      if (updateResult === 0) {
        return sendResponse(
          res,
          StatusCodes.NOT_FOUND,
          ReasonPhrases.NOT_FOUND,
          {
            message: "Favorite list entry not found",
          }
        );
      }
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Favorite list inserted successfully",
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

const fetch_favorite = async (req, res) => {
  let watch_list = [];

  try {
    await authenticationUserMiddleware(req, res, async () => {});
    const watchlist = await find_record(req.user.id);

    if (watchlist && watchlist.items) {
      watch_list.push(watchlist);

      const movieIds = JSON.parse(watchlist.items);

      // Fetch movie details for the IDs in the items array
      const movieDetails = await movie_details(movieIds);

      if (movieDetails.length > 0) {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          favorite_list: watch_list,
          movieDetails: movieDetails,
        });
      } else {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "No movie details found for the given movie IDs.",
        });
      }
    } else {
      sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list not found or items array is missing.",
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

const delete_favorite = async (req, res) => {
  const { favorite_list_id } = req.body;
  try {
    await authenticationUserMiddleware(req, res, async () => {
      const updateResult = await delete_record(req.user.id, favorite_list_id);

      if (updateResult === 0) {
        return sendResponse(
          res,
          StatusCodes.NOT_FOUND,
          ReasonPhrases.NOT_FOUND,
          {
            message: "Watch list entry not found",
          }
        );
      }

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Movie deleted successfully",
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
module.exports = { insert_favorite, fetch_favorite, delete_favorite };
