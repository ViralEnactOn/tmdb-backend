const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { watchListModel, movieModel } = require("../models/index");

const insert = async (req, res) => {
  const { name, isPublic } = req.body;
  try {
    await watchListModel.insert(req.user.id, name, isPublic);

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

const update = async (req, res) => {
  const { id, name, isPublic } = req.body;

  try {
    const updatedWatchList = await watchListModel.update(
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

const remove = async (req, res) => {
  const { id } = req.body;
  try {
    const deletedWatchList = await watchListModel.remove(id, req.user.id);

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

const fetch = async (req, res) => {
  try {
    const watchListData = await watchListModel.fetch(req.user.id);

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
const insertMovie = async (req, res) => {
  const { movie_id, id } = req.body;

  try {
    const updateResult = await watchListModel.insertMovie(
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

const removeMovie = async (req, res) => {
  const { id, movie_id } = req.body;
  try {
    const updateResult = await watchListModel.removeMovie(
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

const fetchMovie = async (req, res) => {
  const { watch_list_id, isPublic, user_id } = req.params;
  let watch_list = [];

  try {
    const watchList = await watchListModel.fetchMovie(
      user_id,
      watch_list_id,
      isPublic
    );

    if (watchList && watchList.movies) {
      watch_list.push(watchList);

      const movieIds = JSON.parse(watchList.movies);
      // Fetch movie details for the IDs in the movies array
      const movieDetails = await movieModel.getDetails(movieIds);

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
  insert,
  update,
  remove,
  fetch,
  insertMovie,
  removeMovie,
  fetchMovie,
};
