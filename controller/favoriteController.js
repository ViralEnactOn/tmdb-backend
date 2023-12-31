const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
const { favoriteModel } = require("../models/index");
const { movieModel } = require("../models/index");

const insert = async (req, res) => {
  const { type, items } = req.body;
  const user = req.user;
  const insertResult = await favoriteModel.insert(user, type, items);
  if (insertResult === 0) {
    return sendResponse(res, StatusCodes.NOT_FOUND, {
      message: "Favorite list entry not found",
    });
  } else if (insertResult === "Movie already there in the favorites") {
    return sendResponse(res, StatusCodes.OK, {
      message: "Movie already there in the favorites",
    });
  } else {
    sendResponse(res, StatusCodes.OK, {
      message: "Favorite list inserted successfully",
    });
  }
};

const fetch = async (req, res) => {
  // let watch_list = [];

  const watchlist = await favoriteModel.fetch(req.user.id);

  if (watchlist && watchlist.items) {
    // watch_list.push(watchlist);

    const movieIds = JSON.parse(watchlist.items);

    // Fetch movie details for the IDs in the items array
    const movieDetails = await movieModel.getDetails(movieIds);

    if (movieDetails.length > 0) {
      sendResponse(res, StatusCodes.OK, {
        // favorite_list: watch_list,
        movieDetails: movieDetails,
      });
    } else {
      sendResponse(res, StatusCodes.OK, {
        message: "No movie details found for the given movie IDs.",
      });
    }
  } else {
    sendResponse(res, StatusCodes.NOT_FOUND, {
      message: "Watch list not found or items array is missing.",
    });
  }
};

const remove = async (req, res) => {
  const { favorite_list_id } = req.body;

  const updateResult = await favoriteModel.remove(
    req.user.id,
    favorite_list_id
  );

  if (updateResult === 0) {
    return sendResponse(res, StatusCodes.NOT_FOUND, {
      message: "Watch list entry not found",
    });
  }

  sendResponse(res, StatusCodes.OK, {
    message: "Movie deleted successfully",
  });
};
module.exports = { insert, fetch, remove };
