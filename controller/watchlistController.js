const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
const { watchListModel, movieModel } = require("../models/index");

const insert = async (req, res) => {
  const { name } = req.body;
  await watchListModel.insert(req.user.id, name);

  sendResponse(res, StatusCodes.OK, {
    message: "New watch list operation successful",
  });
};

const update = async (req, res) => {
  const { id, name } = req.body;

  const updatedWatchList = await watchListModel.update(id, req.user.id, name);

  if (updatedWatchList === 1) {
    sendResponse(res, StatusCodes.OK, {
      message: "Watch list operation successful",
    });
  } else {
    sendResponse(res, StatusCodes.NOT_FOUND, {
      message: "Watch list entry not found",
    });
  }
};

const remove = async (req, res) => {
  const { id } = req.body;

  const deletedWatchList = await watchListModel.remove(id, req.user.id);

  if (deletedWatchList === 1) {
    sendResponse(res, StatusCodes.OK, {
      message: "Watch list delete operation successful",
    });
  } else {
    sendResponse(res, StatusCodes.NOT_FOUND, {
      message: "Watch list entry not found",
    });
  }
};

const fetch = async (req, res) => {
  const watchListData = await watchListModel.fetch(req.user.id);

  sendResponse(res, StatusCodes.OK, {
    watch_list: watchListData,
  });
};

// Insert / Update movie in watch list
const insertMovie = async (req, res) => {
  const { movie_id, id } = req.body;

  const getWatchList = await watchListModel.get(id, req.user.id);
  if (getWatchList) {
    if (!getWatchList.movies || !getWatchList.movies.includes(movie_id)) {
      const updateResult = await watchListModel.insertMovie(
        id,
        req.user.id,
        movie_id
      );

      if (updateResult === 0) {
        return sendResponse(res, StatusCodes.NOT_FOUND, {
          message: "Watch list entry not found",
        });
      }

      sendResponse(res, StatusCodes.OK, {
        message: "Movie inserted successfully",
      });
    } else {
      return sendResponse(res, StatusCodes.OK, {
        message: "Movie already there in the list",
      });
    }
  }
};

const removeMovie = async (req, res) => {
  const { id, movie_id } = req.body;
  const updateResult = await watchListModel.removeMovie(
    id,
    req.user.id,
    movie_id
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

const fetchMovie = async (req, res) => {
  const { watch_list_id, user_id } = req.params;
  let watch_list = [];

  const watchList = await watchListModel.fetchMovie(user_id, watch_list_id);

  if (watchList && watchList.movies) {
    watch_list.push(watchList);

    const movieIds = JSON.parse(watchList.movies);
    // Fetch movie details for the IDs in the movies array
    const movieDetails = await movieModel.getDetails(movieIds);

    if (movieDetails.length > 0) {
      sendResponse(res, StatusCodes.OK, {
        watchlist: watch_list,
        movieDetails: movieDetails,
      });
    } else {
      sendResponse(res, StatusCodes.OK, {
        message: "No movie details found for the given movie IDs.",
      });
    }
  } else {
    sendResponse(res, StatusCodes.NOT_FOUND, {
      message: "Watch list not found or movies array is missing.",
    });
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
