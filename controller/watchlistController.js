const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");
const { watchlistSchema } = require("../schema/userWatchListSchema");
const watchlistModel = require("../models/watchlistModel");
const movieModel = require("../models/movieModel");

const insert_watch_list = async (req, res) => {
  const { name, isPublic } = req.body;
  const insertWatchList = async () => {
    try {
      await watchlistModel.insert_user_watch_list(req.user.id, name, isPublic);

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "New watch list operation successful",
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

  try {
    const tableExists = await watchlistModel.user_watch_list_exist();
    if (!tableExists) {
      await watchlistSchema.then(() => {
        insertWatchList();
      });
    } else {
      await insertWatchList();
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

const update_watch_list = async (req, res) => {
  const { id, name, isPublic } = req.body;

  try {
    const updatedWatchList = await watchlistModel.update_user_watch_list(
      id,
      req.user.id,
      name,
      isPublic
    );

    if (updatedWatchList === 1) {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Watch list operation successful",
      });
    } else {
      sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list entry not found",
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

const delete_watch_list = async (req, res) => {
  const { id } = req.body;
  try {
    const deletedWatchList = await watchlistModel.delete_user_watch_list(
      id,
      req.user.id
    );

    if (deletedWatchList === 1) {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Watch list delete operation successful",
      });
    } else {
      sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list entry not found",
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

const fetch_watch_list = async (req, res) => {
  try {
    const watchListData = await watchlistModel.fetch_user_watch_list(
      req.user.id
    );

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      watch_list: watchListData,
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

// Insert / Update movie in watch list
const insert_movie = async (req, res) => {
  const { movie_id, id } = req.body;

  try {
    const updateResult = await watchlistModel.insert_movie_watch_list(
      id,
      req.user.id,
      movie_id
    );

    if (updateResult === 0) {
      return sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list entry not found",
      });
    }

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      message: "Movie inserted successfully",
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

const delete_movie = async (req, res) => {
  const { id, watch_list_id } = req.body;
  try {
    const updateResult = await watchlistModel.delete_movie_watch_list(
      id,
      req.user.id,
      watch_list_id
    );

    if (updateResult === 0) {
      return sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list entry not found",
      });
    }

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      message: "Movie deleted successfully",
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

const fetch_movie = async (req, res) => {
  const { watch_list_id, isPublic, user_id } = req.params;
  let watch_list = [];

  try {
    const watchlist = await watchlistModel.fetch_movie_watch_list(
      user_id,
      watch_list_id,
      isPublic
    );

    if (watchlist && watchlist.movies) {
      watch_list.push(watchlist);

      const movieIds = JSON.parse(watchlist.movies);
      // Fetch movie details for the IDs in the movies array
      const movieDetails = await movieModel.movie_details(movieIds);

      if (movieDetails.length > 0) {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          watchlist: watch_list,
          movieDetails: movieDetails,
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

module.exports = {
  insert_watch_list,
  update_watch_list,
  delete_watch_list,
  fetch_watch_list,
  insert_movie,
  delete_movie,
  fetch_movie,
};
