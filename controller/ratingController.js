const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
const { ratingModel } = require("../models/index");

const insert = async (req, res) => {
  const { movie_id, type, rating } = req.body;

  await ratingModel.insert(req.user.id, movie_id, type, rating);

  sendResponse(res, StatusCodes.OK, {
    message: "Movie rating inserted successfully",
  });
};

const fetch = async (req, res) => {
  const { movie_id } = req.body;

  const userRating = await ratingModel.fetch(movie_id);

  sendResponse(res, StatusCodes.OK, {
    rating: userRating,
  });
};

module.exports = {
  insert,
  fetch,
};
