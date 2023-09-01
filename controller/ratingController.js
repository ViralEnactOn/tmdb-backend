const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { ratingModel } = require("../models/index");

const insert = async (req, res) => {
  const { movie_id, type, rating } = req.body;

  await ratingModel.insert(req.user.id, movie_id, type, rating);

  sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
    message: "Movie rating inserted successfully",
  });
};

module.exports = {
  insert,
};
