const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const ratingModel = require("../models/ratingModel");

const insert = async (req, res) => {
  const { movie_id, type, rating } = req.body;

  try {
    await ratingModel.insert(req.user.id, movie_id, type, rating);

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

module.exports = {
  insert,
};
